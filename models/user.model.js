import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 4,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      min: 4,
    },
    password: {
      type: String,
      required: true,
      min: 4,
    },
    avatar: {
      type: String,
      default:
        "https://th.bing.com/th/id/OIP.GHGGLYe7gDfZUzF_tElxiQHaHa?w=211&h=211&c=7&r=0&o=5&pid=1.7",
    },
    storeAddress: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: Number,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  },
  { timestamps: true }
);


userSchema.pre("save", async function(next) {
  if(this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;
