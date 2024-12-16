export const getAPIJobsPreview = (page: number, limit: number) =>
    `/api/contentful/jobs/preview?page=${page}&limit=${limit}`;
export const getAPIInternships = (page: number, limit: number) =>
    `/api/contentful/jobs/internships?page=${page}&limit=${limit}`;
export const getAPIJobByID = (id?: string) => `/api/contentful/jobs/${id}`;
