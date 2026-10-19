import mongoose, { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema({
  roll_no: { type: Number, required: true },
  name: { type: String, required: true },
  gr_no: { type: String, required: true },
  birthdate: { type: String, required: true },
  standard: { type: String, required: true },
  school_name: { type: String },
  taluka_dist: { type: String },
  grand_total: { type: Number },
  final_grade: { type: String },
  created_at: { type: Date, default: Date.now }
});

const Student = models.Student || model('Student', StudentSchema);
export default Student;