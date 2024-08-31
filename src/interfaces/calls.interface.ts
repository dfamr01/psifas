export interface Call {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  timestamp: Date;
  messages: Message[];
}

export interface Message {
  sender: string;
  message: string;
  timestamp: Date;
}

export type Address = string;
