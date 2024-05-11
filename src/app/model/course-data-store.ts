import { CourseType, Courses, Projects, SubType } from "./course.model";

export var courses: Courses [] = [
    {value: 'Certified Automation Engineering', label: 'Certified Automation Engineering' },
    {value: 'Diploma in Automation Engineering', label: 'Diploma in Automation Engineering' },
    {value: 'Siemens Automation Training', label: 'Siemens Automation Training'},
    {value: 'Specialized Training', label: 'Specialized Training'},
    {value: 'Emerson Dcs Training', label: 'Emerson Dcs Training'},
    {value: 'ABB 800xA Dcs Training', label: 'ABB 800xA Dcs Training'},
    {value: 'Honeywell EPKS Dcs Training', label: 'Honeywell EPKS Dcs Training'},
    {value: 'Siemens PCS7 Dcs Training', label: 'Siemens PCS7 Dcs Training'},

    // Add more courses as needed
  ];

  export var courses_type: CourseType [] = [
    {value: 'corporate_training', label: 'Corporate Training'},
    {value: 'individual_training', label: 'Individual Training'},
    {value: 'academic_training', label: 'Academic Training'},
  ]

  export var project_type: Projects [] = [
    {value: 'dcs_projects', label: 'DCS Projects'},
    {value: 'plc_projects', label: 'PLC Projects'},
    {value: 'iiot_projects', label: 'IIOT Projects'}
  ]


  export var sub_type: SubType [] = [
    {value: 'specialized_training', label: 'Specialized Training'},
    {value: 'control_system_training', label: 'Control System Training'},
    {value: 'combined_training', label: 'Combined Training'},
  ]