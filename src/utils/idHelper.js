// Helper to normalize IDs (MongoDB uses _id, localStorage uses id)
export const getId = (item) => {
  return item?._id || item?.id || item;
};

export const normalizePanelist = (panelist) => {
  if (!panelist) return null;
  return {
    ...panelist,
    id: getId(panelist),
  };
};

export const normalizeInterview = (interview) => {
  if (!interview) return null;
  return {
    ...interview,
    id: getId(interview),
  };
};

