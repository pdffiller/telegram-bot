import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'texts' })
class Text extends Model<Text> {

  @Column name: string;

  @Column lang: string;

  @Column text: string;

  // todo: remove timestamps
}
export default Text;
