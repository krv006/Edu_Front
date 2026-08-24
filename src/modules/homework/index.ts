export { homeworkApi } from "./api/homework.api";
export type {
  AiResultDto,
  AssignmentDto,
  AssignmentFormInput,
  SubmissionDto,
  SubmissionReviewInput,
} from "./api/homework.dto";
export { HOMEWORK_EXTENSIONS, HOMEWORK_MAX_FILE_SIZE, HOMEWORK_SKILLS } from "./constants/homework.constants";
export { mapAiResultDto, mapAssignmentDto, mapAssignmentRequest, mapSubmissionDto } from "./lib/homework.mappers";
export { validateHomeworkFile } from "./lib/homework-validation";
export { getHomeworkPollingInterval, homeworkKeys, useAssignment, useAssignments, useSubmission, useCreateAssignment, useDeleteAssignment, useDownloadAssignmentFile, useDownloadSubmissionFile, useRecheckSubmission, useReviewSubmission, useSubmitHomework } from "./model/homework.queries";
export { AssignmentDetailDialog } from "./ui/assignment-detail-dialog";
export { HomeworkResultDialog } from "./ui/homework-result-dialog";
