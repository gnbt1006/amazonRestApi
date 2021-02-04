const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('comment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'book',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate:{
        isEmail:{
          msg:"Заавал имайл оруулна уу",
        }
      },
      get(){
          let comment = this.getDataValue("comment").toLowerCase();
          return comment.charAt().toUpperCase() +comment.slice(1); 
      },
      set(value){
          this.setDataValue("comment",value.replace("сонин","хачин"));
      }
    }
  }, {
    sequelize,
    tableName: 'comment',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "comment_bookId_userId_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
          { name: "bookId" },
        ]
      },
      
    ]
  });
};
