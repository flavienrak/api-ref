export interface FileInterface {
  id: number;
  name: string;
  originalName: string;
  extension: string;
  usage: string;
  userId: number;

  createdAt: Date;
  updatedAt: Date;
}
