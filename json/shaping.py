__author__ = 'Jaime Chon <jchon258@gmail.com'
__doc__ = """  """
import json
import xlrd
from xlrd.sheet import Sheet
from pprint import pprint


def generate_student_data(n, file_name):
    import names
    import random
    students = []
    levels = ['Freshman', 'Sophomore', 'Junior', 'Senior']
    ages = list(range(18, 26))
    for i in xrange(1, n+1):
        fname = names.get_first_name()
        lname = names.get_last_name()
        students.append({"SID": i, "FNAME": fname, "LNAME": lname, "LEVEL": random.choice(levels), "AGE": random.choice(ages)})
    data = {'data': students, 'attributes': ['SID', 'FNAME', 'LNAME', 'LEVEL', 'AGE'], 'name': 'Students'}
    write_to_json_file(data, file_name)
    return students


def generate_teacher_data(n, file_name):
    import names
    import random
    teachers = []
    lnames = [names.get_last_name() for _ in range(10)] # half of n, which is known to be 20
    existing = set()
    for i in xrange(1, n+1):
        # lname = names.get_last_name()
        fname = names.get_first_name()
        lname = 'Dr. '+random.choice(lnames)
        full_name = (fname, lname)
        if full_name in existing:
            print('duplicate professor')
        existing.add(full_name)
        teachers.append({"PID": i, "FNAME": fname, "LNAME": lname})
    data = {'data': teachers, 'attributes': ['PID', 'FNAME', 'LNAME'], 'name': 'Professors'}
    write_to_json_file(data, file_name)
    return teachers


def generate_course_names(n, file_name):
    from random import choice
    from string import ascii_uppercase, digits
    course_ids = [''.join([choice(ascii_uppercase) for _ in range(3)]) + ''.join([choice(digits) for _ in range(3)]) for _ in range(25)]
    assert len(set(course_ids)) == 25
    word_file = '/usr/share/tracker/languages/stopwords.en'
    words = [word.strip() for word in open(word_file) if len(word) > 4 and "'" not in word]
    courses = []
    for i in xrange(n):
        cname = ' '.join([choice(words) for _ in xrange(3)])
        courses.append({"CID": course_ids[i], "CNAME": cname})
    data = {'data': courses, 'attributes': ['CID', 'CNAME'], 'name': 'Courses'}
    write_to_json_file(data, file_name)
    return courses


def generate_course_students(courses, students, file_name, distribution):
    from random import sample
    import random
    students = [s['SID'] for s in students]
    courses = [c['CID'] for c in courses]
    course_student = []
    for i in xrange(len(distribution)):
        for _ in xrange(distribution[i]):
            sid = random.choice(students)
            students.remove(sid)
            for _ in xrange(i):
                course_student.append({"CID": random.choice(courses), "SID": sid})
    # for course in courses:
    #     sample_students = sample(students, 25)
    #     for student in sample_students:
    #         course_student.append({"CID": course, "SID": student})
    data = {'data': course_student, 'attributes': ['CID', 'SID'], 'name': 'Course_Student'}
    write_to_json_file(data, file_name)


def generate_course_teachers(courses, teachers, file_name):
    # generates one teacher per course
    assert len(courses) <= len(teachers)
    import random
    courses = [c['CID'] for c in courses]
    teachers = [t['PID'] for t in teachers]
    course_teacher = []
    for course in courses:
        tid = random.choice(teachers)
        teachers.remove(tid)
        course_teacher.append({"CID": course, "PID": tid})
    data = {'data': course_teacher, 'attributes': ['CID', 'PID'], 'name': 'Course_Professor'}
    write_to_json_file(data, file_name)


def natural_join():
    with open('studentsV2.json', 'rb') as students, open('course_studentV2.json', 'rb') as course_student:
        students = json.load(students)
        course_student = json.load(course_student)
        keys_students = set(k for k in students[0].keys())
        keys_course_student = set(k for k in course_student[0].keys())
        keys = keys_students.intersection(keys_course_student)
        result = []
        for student in students:
            for cs in course_student:
                for k in keys:
                    if student[k] != cs[k]:
                        break
                else:
                    result.append(dict(student.items() + cs.items()))
        pprint(result)


def main():
    pass
    # students = generate_student_data(100, 'students.json')
    # courses = generate_course_names(20, 'courses.json')
    # teachers = generate_teacher_data(20, 'professors.json')
    # generate_course_students(courses, students, 'course_student.json', (10, 60, 20, 10))
    # generate_course_teachers(courses, teachers, 'course_professor.json')
    # natural_join()
    # generate_names()
    # xl_sheet_to_json('database.xlsx', 'Students')
    # xl_sheet_to_json('database.xlsx', 'Courses')
    # xl_sheet_to_json('database.xlsx', 'Teachers')
    # xl_sheet_to_json('database.xlsx', 'Course_Student')
    generate_sets()


def generate_sets():
    from names import get_first_name, get_last_name
    from random import choice, sample
    attributes = ['SID', 'FNAME', 'LNAME']
    students = [{'SID': i, 'FNAME': get_first_name(), 'LNAME': get_last_name()} for i in range(1, 13)]
    a = {'attributes': attributes, 'name': 'Students A', 'data': sample(students, 5)}
    b = {'attributes': attributes, 'name': 'Students B', 'data': sample(students, 5)}
    c = {'attributes': attributes, 'name': 'Students C', 'data': sample(students, 5)}
    import json
    json.dump(a, open('setA.json', 'w'))
    json.dump(b, open('setB.json', 'w'))
    json.dump(c, open('setC.json', 'w'))


def xl_sheet_to_json(wbook_name, wsheet_name):
    # workbook = xlrd.open_workbook(wbook_name)
    # students = workbook.sheet_by_name(wsheet_name)
    # students = sheet_to_dict(students)
    # students = dict_to_data_tables_json(students)
    # write_to_json_file(students, wsheet_name+'.json')
    workbook = xlrd.open_workbook(wbook_name)
    wsheet = workbook.sheet_by_name(wsheet_name)
    wsheet = sheet_to_array(wsheet)
    # wsheet = dict_to_data_tables_json(wsheet)
    write_to_json_file(wsheet, wsheet_name+'.json')


def write_to_json_file(data, file_name):
    with open(file_name, 'wb') as f:
        json.dump(data, f)


def dict_to_data_tables_json(data):
    """
    :type data: dict
    """
    return {'data': [[entry[field_name] for field_name in data['field_names']] for entry in data['data']]}


def sheet_to_dict(sheet):
    """
    :type sheet: Sheet
    """
    data = []
    field_names = sheet.row_values(0)
    for row_idx in range(1, sheet.nrows):
        entry = sheet.row_values(row_idx)
        data.append({k: v for k, v in zip(field_names, entry)})
    return {'data': data, 'field_names': field_names}


def sheet_to_array(sheet):
    """
    :type sheet: Sheet
    :rtype: list
    """
    data = []
    field_names = sheet.row_values(0)
    for row_idx in range(1, sheet.nrows):
        entry = sheet.row_values(row_idx)
        data.append({k: v for k, v in zip(field_names, entry)})
    return data


def remove_dr_from_lname():
    with open('professors.json', 'r') as read, open('professorsv2.json', 'w') as write:
        dataset = json.load(read)
        data = dataset['data']
        for entry in data:
            entry['LNAME'] = entry['LNAME'].replace('Dr. ', '')
        json.dump(dataset, write)

if __name__ == '__main__':
    main()
