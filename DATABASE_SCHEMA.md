# FitPlanHub Database Schema Design

## Overview
This document outlines the database schema for FitPlanHub, a platform connecting trainers with users through fitness plans and subscriptions.

## Entity Relationship Diagram

```
Users (1) ────< (M) Subscriptions (M) >─── (1) FitnessPlans
  │                                              │
  │                                              │
  │ (1) ────< (M) Follows (M) >─── (1) Trainers ────< (1) FitnessPlans
```

## Tables

### 1. Users
Stores regular user accounts (non-trainers).

**Fields:**
- `id` (UUID, Primary Key)
- `email` (String, Unique, Not Null)
- `password` (String, Hashed, Not Null)
- `name` (String, Not Null)
- `role` (Enum: 'user' | 'trainer', Default: 'user')
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### 2. Trainers
Stores trainer-specific information. Extends Users.

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → Users.id, Unique)
- `certification` (String, Optional)
- `bio` (Text, Optional)
- `specialization` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationship:** One-to-One with Users (userId references Users.id)

### 3. FitnessPlans
Stores fitness plans created by trainers.

**Fields:**
- `id` (UUID, Primary Key)
- `trainerId` (UUID, Foreign Key → Trainers.id)
- `title` (String, Not Null)
- `description` (Text, Not Null)
- `price` (Decimal, Not Null)
- `duration` (Integer, Not Null) - in days
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationship:** Many-to-One with Trainers (trainerId references Trainers.id)

### 4. Subscriptions
Tracks user subscriptions to fitness plans.

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → Users.id)
- `planId` (UUID, Foreign Key → FitnessPlans.id)
- `purchasedAt` (DateTime)
- `expiresAt` (DateTime) - calculated from duration
- `status` (Enum: 'active' | 'expired', Default: 'active')
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relationship:** 
- Many-to-One with Users (userId references Users.id)
- Many-to-One with FitnessPlans (planId references FitnessPlans.id)
- **Unique Constraint:** (userId, planId) - user can only subscribe once per plan

### 5. Follows
Tracks which trainers users follow.

**Fields:**
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → Users.id)
- `trainerId` (UUID, Foreign Key → Trainers.id)
- `createdAt` (DateTime)

**Relationship:**
- Many-to-One with Users (userId references Users.id)
- Many-to-One with Trainers (trainerId references Trainers.id)
- **Unique Constraint:** (userId, trainerId) - user can only follow a trainer once

## Indexes

- `Users.email` - Unique index for fast login lookups
- `FitnessPlans.trainerId` - Index for trainer's plan queries
- `Subscriptions.userId` - Index for user's subscription queries
- `Subscriptions.planId` - Index for plan subscription queries
- `Follows.userId` - Index for user's following list
- `Follows.trainerId` - Index for trainer's followers list

## Business Rules

1. **Role Separation:** Users with role='trainer' must have a corresponding Trainers record
2. **Plan Ownership:** Only trainers can create fitness plans
3. **Subscription Access:** Users can only view full plan details if they have an active subscription
4. **Follow Relationship:** Users cannot follow themselves (if they become trainers)
5. **Subscription Expiry:** Subscriptions expire based on plan duration from purchase date
