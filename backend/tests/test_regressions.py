"""Real MySQL regression tests. Never target the application database."""
import os
import sys
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import create_app
from config import Config
from extensions import db
from models.student import Student
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, IntegrityError
from services.academic_service import calculate_grade


class MySQLRegressions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if Config.DB_NAME != 'studenthub_audit_test':
            raise RuntimeError('Set DB_NAME=studenthub_audit_test. No production mutation tests allowed.')
        cls.app = create_app({'TESTING': True})
        cls.context = cls.app.app_context()
        cls.context.push()
        if db.engine.url.database != 'studenthub_audit_test':
            raise RuntimeError('Unsafe database target')
        cls.client = cls.app.test_client()
        cls.ids = []

    @classmethod
    def tearDownClass(cls):
        # Only IDs created by this suite; never clear a table.
        db.session.rollback()
        for identifier in cls.ids:
            student = db.session.get(Student, identifier)
            if student:
                db.session.delete(student)
        db.session.commit()
        db.session.remove()
        cls.context.pop()

    def payload(self, **overrides):
        suffix = uuid.uuid4().hex[:12]
        data = dict(roll_number='AUDIT-'+suffix, full_name='Synthetic Audit Student',
                    email=suffix+'@example.invalid', department='Computer Science', semester=4, marks=88.5)
        data.update(overrides)
        return data

    def create(self, **overrides):
        payload = self.payload(**overrides)
        response = self.client.post('/api/students', json=payload)
        self.assertEqual(response.status_code, 201, response.get_json())
        student = response.get_json()['student']
        self.ids.append(student['id'])
        return payload, student

    def test_health_and_safe_read(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['target_database'], 'studenthub_audit_test')
        self.assertEqual(db.session.execute(text('SELECT DATABASE()')).scalar(), 'studenthub_audit_test')

    def test_crud_search_filters_and_persistence(self):
        payload, student = self.create()
        identifier = student['id']
        self.assertEqual(self.client.get(f'/api/students/{identifier}').json['student']['roll_number'], payload['roll_number'])
        for query in [payload['roll_number'], 'Synthetic Audit']:
            response = self.client.get('/api/students/search', query_string={'query': query})
            self.assertIn(identifier, [s['id'] for s in response.json['students']])
        response = self.client.get('/api/students', query_string={'search':payload['roll_number'], 'department':'Computer Science', 'semester':'Semester 4', 'page_size':1})
        self.assertEqual(response.json['total'], 1)
        payload.update(full_name='Synthetic Updated Student', marks=94.5)
        response = self.client.put(f'/api/students/{identifier}', json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['student']['grade'], 'O')
        db.session.remove()
        # A new app/session must observe committed data.
        fresh = create_app({'TESTING': True}).test_client()
        self.assertEqual(fresh.get(f'/api/students/{identifier}').json['student']['marks'], 94.5)
        self.assertEqual(self.client.delete(f'/api/students/{identifier}').status_code, 200)
        self.assertEqual(self.client.get(f'/api/students/{identifier}').status_code, 404)

    def test_duplicate_roll_and_email_and_update_conflict(self):
        payload, student = self.create()
        self.assertEqual(self.client.post('/api/students', json=self.payload(roll_number=payload['roll_number'])).status_code, 409)
        self.assertEqual(self.client.post('/api/students', json=self.payload(email=payload['email'])).status_code, 409)
        second, other = self.create()
        second['email'] = payload['email']
        self.assertEqual(self.client.put(f"/api/students/{other['id']}", json=second).status_code, 409)

    def test_invalid_semesters(self):
        for value in [-1,0,9,1.5,True,False,'-1','1.5','abc4','Semester 4x',None]:
            with self.subTest(value=value):
                self.assertEqual(self.client.post('/api/students', json=self.payload(semester=value)).status_code, 400)

    def test_invalid_marks(self):
        for value in [-0.001,100.001,'NaN','Infinity','-Infinity',True,[],{},'',None]:
            with self.subTest(value=value):
                self.assertEqual(self.client.post('/api/students', json=self.payload(marks=value)).status_code, 400)

    def test_invalid_strings_and_missing_fields(self):
        for field in ['roll_number','full_name','email','department']:
            for value in ['',None,[],{},42,True,'x'*151]:
                with self.subTest(field=field, value=value):
                    self.assertEqual(self.client.post('/api/students', json=self.payload(**{field:value})).status_code, 400)
        for value in [{},[],None,{'email':'bad'}]:
            self.assertEqual(self.client.post('/api/students', json=value).status_code, 400)
        self.assertEqual(self.client.post('/api/students', data='{bad', content_type='application/json').status_code,400)

    def test_missing_students_and_http_errors(self):
        for method in ['get','put','delete']:
            self.assertEqual(getattr(self.client, method)('/api/students/9223372036854775807').status_code,404)
        self.assertEqual(self.client.get('/api/missing').status_code,404)
        self.assertEqual(self.client.patch('/api/students').status_code,405)

    def test_numeric_roll_separate_from_primary_id(self):
        payload, student = self.create(roll_number='777777777')
        response = self.client.get('/api/students', query_string={'roll_number':payload['roll_number']})
        self.assertEqual(response.json['students'][0]['id'], student['id'])
        self.assertEqual(self.client.get('/api/students/777777777').status_code,404)

    def test_pagination_and_injection(self):
        response = self.client.get('/api/students?page=0&page_size=999999')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json['page_size'],1000)
        self.assertEqual(response.json['page'],1)
        response = self.client.get('/api/students',query_string={'search':"' OR 1=1 --"})
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json['total'],0)
        self.assertEqual(self.client.get('/api/students?semester=-1').status_code,400)

    def test_statistics_and_grading_boundaries(self):
        for marks, grade in [(0,'Fail'),(39.99,'Fail'),(40,'Pass'),(50,'B'),(60,'B+'),(70,'A'),(80,'A+'),(90,'O'),(100,'O')]:
            with self.subTest(marks=marks):
                self.assertEqual(calculate_grade(marks),grade)
                _, student = self.create(marks=marks)
                self.assertEqual(student['grade'],grade)
        records = self.client.get('/api/students/results').json
        scores = [s['marks'] for s in records['results']]
        metrics = records['metrics']
        self.assertEqual(metrics['passed_count'],sum(m>=40 for m in scores))
        self.assertEqual(metrics['distinction_count'],sum(m>=80 for m in scores))
        stats = self.client.get('/api/dashboard/stats').json
        self.assertEqual(stats['total_students'],len(scores))
        self.assertEqual(stats['average_marks'],round(sum(scores)/len(scores),1))
        self.assertEqual(stats['pass_rate'],round(sum(m>=40 for m in scores)*100/len(scores),1))

    def test_safe_database_errors_and_rollback(self):
        secret = 'SIMULATED_PRIVATE_SQL'
        with patch.object(db.session, 'commit', side_effect=OperationalError(secret,{},Exception(secret))):
            response = self.client.post('/api/students', json=self.payload())
            self.assertEqual(response.status_code,503)
            self.assertNotIn(secret,response.get_data(as_text=True))
        self.assertEqual(self.client.get('/api/students').status_code,200)
        with patch.object(db.session, 'execute', side_effect=OperationalError(secret,{},Exception(secret))):
            response = self.client.get('/api/health')
            self.assertEqual(response.status_code,503)
            self.assertNotIn(secret,response.get_data(as_text=True))

    def test_racing_duplicate_safe_conflict(self):
        import pymysql
        error = IntegrityError('SIMULATED_PRIVATE_SQL',{},pymysql.err.IntegrityError(1062,'duplicate'))
        with patch.object(db.session,'commit',side_effect=error):
            response = self.client.post('/api/students',json=self.payload())
            self.assertEqual(response.status_code,409)
            self.assertNotIn('SIMULATED_PRIVATE_SQL',response.get_data(as_text=True))
        self.assertEqual(self.client.get('/api/students').status_code,200)

    def test_cors_restriction(self):
        for origin, allowed in [(Config.FRONTEND_ORIGIN,True),('https://untrusted.example',False)]:
            response = self.client.options('/api/students',headers={'Origin':origin,'Access-Control-Request-Method':'POST'})
            self.assertEqual('Access-Control-Allow-Origin' in response.headers,allowed)
            self.assertNotIn('Access-Control-Allow-Credentials',response.headers)

    def test_optional_profile_values_are_not_fabricated(self):
        _, student = self.create()
        self.assertEqual(student['coursework'],[])
        self.assertEqual(student['phone'],'')
        self.assertEqual(student['advisor'],'Not recorded')

if __name__ == '__main__':
    unittest.main(verbosity=2)
