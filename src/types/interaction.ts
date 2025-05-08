interface InteractionRecord {
  _id: string;
  userId: string;
  prospectId: string;
  interactionId: string;
  interactionType: string;
  subject: string;
  details: string;
  status: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  extraData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default InteractionRecord;
