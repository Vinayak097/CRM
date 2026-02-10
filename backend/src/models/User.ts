import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
export enum Role {
  Admin = "admin",
  SalesAgent = "sales_agent",
  OnboardingAgent = "onboarding_agent",
  SalesManager = "sales_manager",
  BusinessHead = "business_head",
  // Legacy - kept for backwards compatibility
  Developer = "developer",
}
export interface IOnboardingItem {
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  updatedAt: Date;
}

export interface IAssignedProperty extends IOnboardingItem {
  propertyId: string;
}

export interface IAssignedProject extends IOnboardingItem {
  projectId: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  assignedLeadsCount: number;
  managedBy?: mongoose.Types.ObjectId;
  assignedProperties: IAssignedProperty[];
  assignedProjects: IAssignedProject[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

const OnboardingItemSchema = {
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  rejectionReason: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    assignedLeadsCount: {
      type: Number,
      default: 0,
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IUser) {
        // Only required for agents (optional for backward compatibility)
        return false;
      },
    },
    assignedProperties: [{
      propertyId: { type: String, required: true },
      ...OnboardingItemSchema
    }],
    assignedProjects: [{
      projectId: { type: String, required: true },
      ...OnboardingItemSchema
    }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
