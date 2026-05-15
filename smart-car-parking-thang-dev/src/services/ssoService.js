const users = require('../models/users');

exports.registerUser = async (username, password, name, email, student_id, license_plate) => {
  if(users.find(u=>u.username===username)) return null;
  const id = users.length+1;
  const user = {id, username, password, name, email, student_id, license_plate, role:'member', status:'Active'};
  users.push(user);
  return user;
};

exports.validateIdentity = async (username,password,role = 'member') => {
  const user = users.find(u=>u.username===username && u.password===password);
  if(!user) return null;
  if(role === 'admin' && user.role !== 'admin') return null;
  if(role !== 'admin' && user.role === 'admin') return null;
  return user;
};