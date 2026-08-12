export { courseApi } from "./api/course.api";
export type {
  CourseDto,
  CourseFormInput,
  CourseRequestDto,
  CourseStudentSearchDto,
  EnrollmentAction,
  EnrollmentDto,
  EnrollPayload,
} from "./api/course.dto";
export { mapCourseDto, mapCoursePage, mapCourseRequest, mapCourseUserDto, mapEnrollmentDto } from "./lib/course.mappers";
export {
  courseKeys,
  useCourse,
  useCourses,
  useCoursePage,
  useCourseCatalog,
  useCourseStudents,
  useCourseRequests,
  useCreateCourse,
  useCreateEnrollment,
  useDeleteCourse,
  useCreateCourseStudent,
  useEnrollStudent,
  useRespondCourseRequest,
  useSearchCourseStudents,
  useUnenrollStudent,
  useUpdateCourse,
} from "./model/course.queries";
export { AddStudentDialog } from "./ui/add-student-dialog";
