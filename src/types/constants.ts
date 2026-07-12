export const USER_ROLES = ['ADMIN', 'WORKER', 'CONTRACTOR', 'AGENT'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'BLOCKED', 'INACTIVE', 'DELETED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const GENDERS = ['MALE', 'FEMALE', 'OTHERS'] as const;
export type Gender = (typeof GENDERS)[number];

export const WORKER_PROFILE_STATUSES = ['PENDING', 'VERIFIED', 'BLOCKED', 'SUSPENDED'] as const;
export type WorkerProfileStatus = (typeof WORKER_PROFILE_STATUSES)[number];

export const AVAILABILITY_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY', 'PROJECT_BASED'] as const;
export type AvailabilityType = (typeof AVAILABILITY_TYPES)[number];

export const AVAILABILITY_STATUSES = ['PRESENT', 'ABSENT', 'MAYBE'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const JOB_STATUSES = ['OPEN', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const ASSIGNMENT_STATUSES = [
  'OFFERED',
  'ACCEPTED',
  'DECLINED',
  'BOOKED',
  'COMPLETED',
  'NO_SHOW',
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const PAYMENT_TYPES = ['CREDIT', 'DEBIT'] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];
