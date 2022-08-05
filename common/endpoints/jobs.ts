export const getAPIJobsPreview = (page:number, limit:number) => `/api/contentful/jobs/preview?page=${page}&limit=${limit}`;
export const getAPIJobByID = (id?:string) => `/api/contentful/jobs/${id}`;