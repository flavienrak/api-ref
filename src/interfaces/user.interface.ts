import { FileInterface } from './file.interface';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  acceptConditions: boolean;
  role: string;
  qualiCarriere: string;

  files: FileInterface[];

  createdAt: Date;
  updatedAt: Date;
}
