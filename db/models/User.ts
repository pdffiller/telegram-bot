import { Table, Column, Model, BeforeUpdate, BeforeCreate } from 'sequelize-typescript';
import sequelize from 'sequelize'

@Table({ tableName: 'users' })
class User extends Model<User> {


  static getStringValue(str: string | null) {
    if (!str) return null;

    const match = str.match(/\w+/);
    if (!match) return null;
    return match[1];
  }

  @BeforeCreate
  @BeforeUpdate
  static validate(user: User) {
    user.username = this.getStringValue(user.username);
    user.last_name = this.getStringValue(user.last_name);
    user.first_name = this.getStringValue(user.first_name);
  }

  @Column telegramId: number;

  @Column(sequelize.STRING) first_name: string | null;
  
  @Column(sequelize.STRING) last_name: string | null;

  @Column(sequelize.STRING) username: string | null;

  @Column company: string;

  @Column timing: number;

  @Column questionId: number;
}
export default User;
