import asyncWrapper from "../../../utilities/async-wrapper";
import AdminInstructor from "../../../models/admin/instructor";
import {
  SS0006,
  SS0007,
  SS0008,
  SS0009,
  SS0010,
} from "../../../errors/errorCodes";
import { Log } from "../../../utilities/debug";
import mongoose from "mongoose";

// @desc      Get All Instructors
// @route     POST /api/admin/instructors
// @access    Private
export const getAllInstructors = asyncWrapper(async (req, res) => {
  try {
    const instructors = await AdminInstructor.find();

    res.status(200).json(instructors);
  } catch (error) {
    res.status(400).json({ message: "[SS0006 Something went wrong" });
    Log.error(error, `Error: ${SS0006}`);
  }
});

// @desc      Create Instructor
// @route     POST /api/admin/instructor
// @access    Private
export const createInstructor = asyncWrapper(async (req, res) => {
  const instructorData = req.body;

  const exist = await AdminInstructor.findOne({
    email: instructorData.email,
  });
  const newInstructor = new AdminInstructor(instructorData);
  try {
    if (!exist) {
      await newInstructor.save();
      res.status(201).json(newInstructor);
    } else {
      res.status(201).json({
        message: `Instructor already exists with same email.`,
      });
    }
  } catch (error) {
    res.status(400).json({ message: "[SS0007 Something went wrong" });
    Log.error(error, `Error: ${SS0007}`);
  }
});

// @desc      Edit Instructor
// @route     POST /api/admin/instructor/:id
// @access    Private
export const editInstructor = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const _id = id;

  const instructor = req.body;

  try {
    if (_id) {
      await AdminInstructor.findByIdAndUpdate(
        _id,
        { ...instructor, _id },
        { new: true }
      );
      //   res.status(201).json(updatedInstructor);
      res.status(201).json({ message: "Instructor Updated Successfully!" });
    } else {
      res.status(201).json({ message: "Instructor is missing!" });
    }
  } catch (error) {
    res.status(400).json({ message: "[SS0008 Something went wrong" });
    Log.error(error, `Error: ${SS0008}`);
  }
});

// @desc      Get instructor by its _id
// @route     POST /api/admin/instructor/by/id
// @access    Private
export const getInstructorById = asyncWrapper(async (req, res) => {
  const { instructorId } = req.body;
  const instructor = await AdminInstructor.findOne({
    _id: instructorId,
  });
  try {
    if (instructor) {
      res.status(200).json(instructor);
    } else {
      res.status(201).json({
        message: `Instructor does not exist with the id ${instructorId}`,
      });
    }
  } catch (error) {
    res.status(400).json({ message: "[SS0009 Something went wrong" });
    Log.error(error, `Error: ${SS0009}`);
  }
});

// @desc      Get Instructor by email
// @route     POST /api/admin/instructor/by/email
// @access    Private
export const getInstructorByEmail = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  const instructor = await AdminInstructor.findOne({ email: email });
  try {
    if (instructor) {
      res.status(200).json(instructor);
    } else {
      res.status(201).json({
        message: `Instructor does not exist with the email ${email}`,
      });
    }
  } catch (error) {
    res.status(400).json({ message: "[SS0010 Something went wrong" });
    Log.error(error, `Error: ${SS0010}`);
  }
});
