import { TicketData } from '../../../types';

export interface IssueTrackerProvider {
  fetchTicket(ticketId: string): Promise<TicketData>;
  addComment(ticketId: string, text: string): Promise<void>;
  addChildTask(
    parentTicketId: string,
    title: string,
    description: string,
  ): Promise<void>;
  createProductBacklogItem(
    parentTicketId: string,
    title: string,
    description: string,
    acceptanceCriteria: string,
  ): Promise<void>;
}
