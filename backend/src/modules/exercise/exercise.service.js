/**
 * src/modules/exercise/exercise.service.js
 *
 * Service สำหรับโมดูล Exercise
 */

const repository = require('./exercise.repository');

const listExercises = (filters) => repository.findAll(filters);

const getExerciseById = async (id) => {
  const exercise = await repository.findById(id);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return exercise;
};

const createExercise = (data) => repository.create(data);

const updateExercise = async (id, data) => {
  await getExerciseById(id);
  return repository.update(id, data);
};

const deleteExercise = async (id) => {
  await getExerciseById(id);
  await repository.remove(id);
};

module.exports = { listExercises, getExerciseById, createExercise, updateExercise, deleteExercise };
