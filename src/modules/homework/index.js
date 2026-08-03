export { homeworkApi } from "./api/homework.api";
export { HOMEWORK_EXTENSIONS, HOMEWORK_MAX_FILE_SIZE, HOMEWORK_SKILLS } from "./constants/homework.constants";
export { mapAiResultDto, mapAssignmentDto, mapAssignmentRequest, mapSubmissionDto } from "./lib/homework.mappers";
export { validateHomeworkFile } from "./lib/homework-validation";
export { getHomeworkPollingInterval, homeworkKeys, useAssignment, useAssignments, useSubmission, useCreateAssignment, useDeleteAssignment, useRecheckSubmission, useSubmitHomework } from "./model/homework.queries";
