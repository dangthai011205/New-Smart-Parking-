const ssoService = require('../services/ssoService');

exports.register = async (req, res) => {
  const { username, password, name, email, student_id, license_plate } = req.body;
  const userData = await ssoService.registerUser(username, password, name, email, student_id, license_plate);
  if(userData) return res.json({success:true, user:userData});
  return res.status(400).json({success:false, message:'User already exists'});
};

exports.login = async (req,res) => {
  const { username, password, role } = req.body;
  const user = await ssoService.validateIdentity(username, password, role);
  if(user){
    req.session.user = user;
    return res.json({success:true, user});
  }

  const message = role === 'admin'
    ? 'Invalid admin credentials or insufficient permissions.'
    : 'Invalid credentials.';
  res.status(401).json({success:false, message});
};

exports.logout = (req,res) => {
  req.session.destroy();
  res.json({success:true});
};

exports.getProfile = (req, res) => {
  if (!req.session.user) return res.status(401).json({success:false, message:'Not authenticated'});
  const { id, name, email, student_id, license_plate, role } = req.session.user;
  return res.json({success:true, user:{ id, name, email, student_id, license_plate, role }});
};