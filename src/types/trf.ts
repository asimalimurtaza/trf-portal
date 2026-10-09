export type UserRole = 'manager' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  designation: string;
  joiningDate: string; // ISO format or YYYY-MM-DD
  birthDate: string;   // MM-DD or YYYY-MM-DD
  joiningFeeStatus: 'paid' | 'pending' | 'waived';
  joiningFeeAmount: number; // e.g. 1000 PKR
  phone?: string;
  isActive: boolean;
}

export type TransactionType = 'inflow' | 'outflow';

export type TransactionCategory =
  | 'company_claim'    // 1400 PKR / head
  | 'joining_fee'      // New member joining contribution
  | 'treat_event'      // Member bought phone / promotion treat
  | 'fine_penalty'     // Late coming / rule fine
  | 'team_dinner'      // Outflow
  | 'team_lunch'       // Outflow
  | 'snacks_refreshment'// Outflow
  | 'birthday_cake'    // Outflow
  | 'activity_outing'  // Outflow (bowling, gaming, etc.)
  | 'miscellaneous';

export interface Transaction {
  id: string;
  date: string;
  title: string;
  description?: string;
  amount: number; // PKR
  type: TransactionType;
  category: TransactionCategory;
  loggedBy: string; // User ID or Name
  relatedMemberId?: string; // e.g. who gave the treat or who paid joining fee
  receiptUrl?: string;
  createdAt: string;
}

export type ClaimStatus = 'draft' | 'submitted' | 'approved_disbursed' | 'rejected';

export interface AuditClaim {
  id: string;
  monthYear: string; // e.g. "October 2026"
  headcount: number;
  ratePerHead: number; // 1400 PKR
  totalAmount: number; // headcount * 1400 PKR
  status: ClaimStatus;
  submissionDate?: string;
  disbursedDate?: string;
  auditNotes?: string;
  claimRefNumber?: string;
  submittedBy: string; // Manager
}

export interface ContributionRule {
  id: string;
  title: string;
  description: string;
  suggestedAmount: number; // PKR
  icon: string; // icon identifier
  isMandatory: boolean;
}

export interface MemberTreatEvent {
  id: string;
  memberId: string;
  memberName: string;
  ruleTitle: string; // e.g. "New iPhone 16 Pro", "Promoted to Senior Eng"
  details: string;
  amount: number; // PKR
  date: string;
  status: 'pending' | 'collected';
  collectedDate?: string;
}

export interface VenuePlace {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'adventure' | 'gaming' | 'outdoor';
  location: string;
  estimatedCostPerHead: number; // PKR
  rating: number; // 1-5
  votes: string[]; // array of user IDs who upvoted
  suggestedBy: string;
  description: string;
  mapsUrl?: string;
  status: 'wishlist' | 'planned' | 'visited';
}

export interface PlannedActivity {
  id: string;
  title: string;
  venueId?: string;
  venueName: string;
  date: string;
  time?: string;
  estimatedTotalBudget: number; // PKR
  trfContributionShare: number; // PKR covered by TRF
  personalContributionPerHead: number; // PKR balance per head
  status: 'voting' | 'confirmed' | 'completed' | 'cancelled';
  rsvps: {
    userId: string;
    userName: string;
    status: 'going' | 'maybe' | 'not_going';
  }[];
  description: string;
}

export interface TRFOverviewStats {
  currentBalance: number;
  totalInflow: number;
  totalOutflow: number;
  activeHeadcount: number;
  monthlyCompanyAllowanceRate: number; // 1400 PKR
  currentMonthClaimStatus: ClaimStatus | 'not_created';
  pendingClaimsAmount: number;
  pendingMemberDuesAmount: number;
}
