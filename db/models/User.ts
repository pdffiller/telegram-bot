import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'users' })
class User extends Model<User> {

  @Column telegramId: number;

  @Column first_name: string;
  
  @Column last_name: string;

  @Column username: string;

  @Column company: string;

  @Column timing: number;

  @Column questionId: number;
}
export default User;
