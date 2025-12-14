// In-memory data store (no database required)

let users = [];
let trainers = [];
let plans = [];
let subscriptions = [];
let follows = [];

let userIdCounter = 1;
let trainerIdCounter = 1;
let planIdCounter = 1;
let subscriptionIdCounter = 1;
let followIdCounter = 1;

export const dataStore = {
  // Users
  createUser: (userData) => {
    const user = {
      id: `user-${userIdCounter++}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return user;
  },

  findUserByEmail: (email) => {
    return users.find(u => u.email === email);
  },

  findUserById: (id) => {
    return users.find(u => u.id === id);
  },

  // Trainers
  createTrainer: (trainerData) => {
    const trainer = {
      id: `trainer-${trainerIdCounter++}`,
      ...trainerData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    trainers.push(trainer);
    return trainer;
  },

  findTrainerByUserId: (userId) => {
    return trainers.find(t => t.userId === userId);
  },

  findTrainerById: (id) => {
    return trainers.find(t => t.id === id);
  },

  // Plans
  createPlan: (planData) => {
    const plan = {
      id: `plan-${planIdCounter++}`,
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    plans.push(plan);
    return plan;
  },

  findAllPlans: () => {
    return plans
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(plan => {
        const trainer = trainers.find(t => t.id === plan.trainerId);
        const user = trainer ? users.find(u => u.id === trainer.userId) : null;
        return {
          ...plan,
          trainer: trainer ? { ...trainer, user } : null,
          _count: {
            subscriptions: subscriptions.filter(s => s.planId === plan.id).length
          }
        };
      });
  },

  findPlanById: (id) => {
    const plan = plans.find(p => p.id === id);
    if (!plan) return null;
    
    const trainer = trainers.find(t => t.id === plan.trainerId);
    const user = trainer ? users.find(u => u.id === trainer.userId) : null;
    
    return {
      ...plan,
      trainer: trainer ? { ...trainer, user } : null
    };
  },

  findPlansByTrainerId: (trainerId) => {
    return plans
      .filter(p => p.trainerId === trainerId)
      .map(plan => ({
        ...plan,
        _count: {
          subscriptions: subscriptions.filter(s => s.planId === plan.id).length
        }
      }));
  },

  updatePlan: (id, planData) => {
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    plans[index] = {
      ...plans[index],
      ...planData,
      updatedAt: new Date()
    };
    
    return plans[index];
  },

  deletePlan: (id) => {
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) return false;
    plans.splice(index, 1);
    return true;
  },

  // Subscriptions
  createSubscription: (subscriptionData) => {
    const subscription = {
      id: `sub-${subscriptionIdCounter++}`,
      ...subscriptionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    subscriptions.push(subscription);
    return subscription;
  },

  findSubscription: (userId, planId) => {
    return subscriptions.find(s => 
      s.userId === userId && 
      s.planId === planId && 
      s.status === 'ACTIVE' &&
      new Date(s.expiresAt) >= new Date()
    );
  },

  findSubscriptionsByUserId: (userId) => {
    return subscriptions
      .filter(s => s.userId === userId)
      .map(sub => {
        const plan = plans.find(p => p.id === sub.planId);
        const trainer = plan ? trainers.find(t => t.id === plan.trainerId) : null;
        const user = trainer ? users.find(u => u.id === trainer.userId) : null;
        
        return {
          ...sub,
          plan: plan ? {
            ...plan,
            trainer: trainer ? { ...trainer, user } : null
          } : null
        };
      });
  },

  findSubscriptionById: (id) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return null;
    
    const plan = plans.find(p => p.id === sub.planId);
    const trainer = plan ? trainers.find(t => t.id === plan.trainerId) : null;
    const user = trainer ? users.find(u => u.id === trainer.userId) : null;
    
    return {
      ...sub,
      plan: plan ? {
        ...plan,
        trainer: trainer ? { ...trainer, user } : null
      } : null
    };
  },

  updateSubscriptionStatus: (id, status) => {
    const index = subscriptions.findIndex(s => s.id === id);
    if (index === -1) return null;
    subscriptions[index].status = status;
    subscriptions[index].updatedAt = new Date();
    return subscriptions[index];
  },

  // Follows
  createFollow: (followData) => {
    const follow = {
      id: `follow-${followIdCounter++}`,
      ...followData,
      createdAt: new Date()
    };
    follows.push(follow);
    return follow;
  },

  findFollow: (userId, trainerId) => {
    return follows.find(f => f.userId === userId && f.trainerId === trainerId);
  },

  deleteFollow: (userId, trainerId) => {
    const index = follows.findIndex(f => f.userId === userId && f.trainerId === trainerId);
    if (index === -1) return false;
    follows.splice(index, 1);
    return true;
  },

  findFollowingByUserId: (userId) => {
    return follows
      .filter(f => f.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(follow => {
        const trainer = trainers.find(t => t.id === follow.trainerId);
        const user = trainer ? users.find(u => u.id === trainer.userId) : null;
        return {
          ...follow,
          trainer: trainer ? {
            ...trainer,
            user,
            _count: {
              plans: plans.filter(p => p.trainerId === trainer.id).length,
              followers: follows.filter(f => f.trainerId === trainer.id).length
            }
          } : null
        };
      });
  },

  findFollowersByTrainerId: (trainerId) => {
    return follows
      .filter(f => f.trainerId === trainerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(follow => {
        const user = users.find(u => u.id === follow.userId);
        return {
          ...follow,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email
          } : null
        };
      });
  },

  // Helper methods
  getTrainerPlans: (trainerId) => {
    return plans
      .filter(p => p.trainerId === trainerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(plan => ({
        ...plan,
        _count: {
          subscriptions: subscriptions.filter(s => s.planId === plan.id).length
        }
      }));
  },

  getTrainerProfile: (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (!trainer) return null;
    
    const user = users.find(u => u.id === trainer.userId);
    const trainerPlans = plans.filter(p => p.trainerId === trainerId);
    
    return {
      ...trainer,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email
      } : null,
      plans: trainerPlans
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(plan => ({
          ...plan,
          _count: {
            subscriptions: subscriptions.filter(s => s.planId === plan.id).length
          }
        })),
      _count: {
        followers: follows.filter(f => f.trainerId === trainerId).length,
        plans: trainerPlans.length
      }
    };
  }
};
