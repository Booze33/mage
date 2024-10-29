declare type User = {
  user_id: string;
  name: string;
};

declare type Chat = {
  chat_id: string;
  title: string;
};

declare type Message = {
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  time_sent: Date;
};

declare type ChatPageProps =  {
  params: { chat_id: string };
}