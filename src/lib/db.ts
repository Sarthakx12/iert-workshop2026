
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "user" | "admin";
  credits: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  item: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_private: boolean;
}

export interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_credits: number;
  max_uses: number;
  used_count: number;
  redeemed_by: string[];
}

export interface Session {
  token: string;
  user_id: string;
  created_at: number;
  expires_at: number;
}

export interface DbSchema {
  users: User[];
  orders: Order[];
  notes: Note[];
  comments: Comment[];
  coupons: Coupon[];
  sessions: Session[];
}

const DB_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "local-db.json"
);

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

// Default demonstration data
function getDefaultData(): DbSchema {
  return {
    users: [
      {
        id: "user-a-1111",
        email: "usera@example.com",
        passwordHash: bcrypt.hashSync("Password123!", BCRYPT_ROUNDS),
        name: "User A",
        role: "user",
        credits: 0,
      },
      {
        id: "user-b-2222",
        email: "userb@example.com",
        passwordHash: bcrypt.hashSync("Password123!", BCRYPT_ROUNDS),
        name: "User B",
        role: "user",
        credits: 0,
      },
      {
        id: "admin-3333",
        email: "admin@example.com",
        passwordHash: bcrypt.hashSync("Admin123!", BCRYPT_ROUNDS),
        name: "Admin User",
        role: "admin",
        credits: 1000,
      },
    ],

    orders: [
      {
        id: "ORD-101",
        user_id: "user-a-1111",
        user_email: "usera@example.com",
        item: "FlowVault Pro Starter Kit",
        amount: 49.99,
        status: "delivered",
        created_at: "2026-01-10T14:22:00Z",
      },
      {
        id: "ORD-102",
        user_id: "user-a-1111",
        user_email: "usera@example.com",
        item: "Enterprise Vector Indexer",
        amount: 199,
        status: "processing",
        created_at: "2026-01-15T09:15:00Z",
      },
      {
        id: "ORD-201",
        user_id: "user-b-2222",
        user_email: "userb@example.com",
        item: "Automated Payroll Engine",
        amount: 850,
        status: "completed",
        created_at: "2026-01-12T11:45:00Z",
      },
      {
        id: "ORD-202",
        user_id: "user-b-2222",
        user_email: "userb@example.com",
        item: "Confidential B2B License",
        amount: 1200,
        status: "active",
        created_at: "2026-01-18T16:30:00Z",
      },
    ],

    notes: [
      {
        id: "note-1",
        user_id: "user-a-1111",
        title: "Project Roadmap",
        content: "User A project roadmap",
        is_private: true,
      },
      {
        id: "note-2",
        user_id: "user-b-2222",
        title: "Payout Secret",
        content: "CONFIDENTIAL: User B payout secret",
        is_private: true,
      },
    ],

    comments: [
      {
        id: "comm-1",
        author_name: "FlowVault Team",
        body: "Welcome to FlowVault community discussion. Leave your feedback below!",
        created_at: "2026-01-01T10:00:00.000Z",
      },
    ],

    coupons: [
      {
        code: "PRO50",
        discount_credits: 500,
        max_uses: 1,
        used_count: 0,
        redeemed_by: [],
      },
    ],

    sessions: [],
  };
}

// Migrate existing plaintext passwords to bcrypt hashes.
// This also supports older session records.
function migrateData(raw: Partial<DbSchema>): DbSchema {
  const defaults = getDefaultData();
  const source = raw as Record<string, any>;

  const users: User[] = Array.isArray(source.users)
    ? source.users.map((user: Record<string, any>) => {
        let passwordHash = user.passwordHash;

        if (!passwordHash && typeof user.password === "string") {
          passwordHash = bcrypt.hashSync(
            user.password,
            BCRYPT_ROUNDS
          );
        }

        const { password: _legacyPassword, ...safeUser } = user;

        return {
          ...safeUser,
          passwordHash,
        } as User;
      })
    : defaults.users;

 
const sessions: Session[] = Array.isArray(source.sessions)
  ? source.sessions.map(
      (session: Record<string, any>): Session => {
        const createdAt =
          typeof session.created_at === "number"
            ? session.created_at
            : Date.now();

        return {
          token: String(session.token ?? ""),
          user_id: String(session.user_id ?? ""),
          created_at: createdAt,
          expires_at:
            typeof session.expires_at === "number"
              ? session.expires_at
              : createdAt + SESSION_TTL_MS,
        };
      }
    )
  : [];


  return {
    ...defaults,
    ...source,
    users,
    sessions,
    orders: Array.isArray(source.orders) ? source.orders : defaults.orders,
    notes: Array.isArray(source.notes) ? source.notes : defaults.notes,
    comments: Array.isArray(source.comments) ? source.comments : defaults.comments,
    coupons: Array.isArray(source.coupons) ? source.coupons : defaults.coupons,
  };
}

// In-memory cache
let inMemoryData: DbSchema | null = null;

function loadData(): DbSchema {
  if (inMemoryData) {
    return inMemoryData;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);

      inMemoryData = migrateData(parsed);

      // Persist the migration
      saveData(inMemoryData);

      return inMemoryData;
    }
  } catch (error) {
    console.error("Database loading failed:", error);
    throw new Error("Unable to load database");
  }

  inMemoryData = getDefaultData();
  saveData(inMemoryData);

  return inMemoryData;
}

function saveData(data: DbSchema): void {
  inMemoryData = data;

  const dir = path.dirname(DB_FILE_PATH);

  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    DB_FILE_PATH,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export const db = {
  reset(): void {
    const fresh = getDefaultData();
    saveData(fresh);
  },

  getUserByEmail(email: string): User | undefined {
    const data = loadData();

    return data.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  },

  getUserById(id: string): User | undefined {
    const data = loadData();
    return data.users.find((user) => user.id === id);
  },

  getAllUsers(): User[] {
    const data = loadData();
    return data.users;
  },

  updateUser(
    id: string,
    updates: Partial<User>
  ): User | undefined {
    const data = loadData();

    const index = data.users.findIndex((user) => user.id === id);

    if (index === -1) return undefined;

    data.users[index] = {
      ...data.users[index],
      ...updates,
    };

    saveData(data);

    return data.users[index];
  },

  createSession(userId: string): string {
    const data = loadData();

    const userExists = data.users.some((user) => user.id === userId);

    if (!userExists) {
      throw new Error("Cannot create session for unknown user");
    }

    // Remove expired sessions
    data.sessions = data.sessions.filter(
      (session) => session.expires_at > Date.now()
    );

    // Cryptographically secure session token
    const token = randomBytes(32).toString("hex");

    const now = Date.now();

    data.sessions.push({
      token,
      user_id: userId,
      created_at: now,
      expires_at: now + SESSION_TTL_MS,
    });

    saveData(data);

    return token;
  },

  getUserBySession(token: string): User | undefined {
    if (!token) return undefined;

    const data = loadData();

    const session = data.sessions.find(
      (item) =>
        item.token === token &&
        item.expires_at > Date.now()
    );

    if (!session) return undefined;

    return data.users.find(
      (user) => user.id === session.user_id
    );
  },

  revokeSession(token: string): void {
    const data = loadData();

    data.sessions = data.sessions.filter(
      (session) => session.token !== token
    );

    saveData(data);
  },

  getOrderById(id: string): Order | undefined {
    const data = loadData();
    return data.orders.find((order) => order.id === id);
  },

  getOrdersByUserId(userId: string): Order[] {
    const data = loadData();

    return data.orders.filter(
      (order) => order.user_id === userId
    );
  },

  getAllOrders(): Order[] {
    const data = loadData();
    return data.orders;
  },

  getNotesByUserId(userId: string): Note[] {
    const data = loadData();

    return data.notes.filter(
      (note) => note.user_id === userId
    );
  },

  getAllNotes(): Note[] {
    const data = loadData();
    return data.notes;
  },

  getComments(): Comment[] {
    const data = loadData();
    return data.comments;
  },

  addComment(authorName: string, body: string): Comment {
    const data = loadData();

    const newComment: Comment = {
      id:
        "comm-" +
        Date.now().toString(36) +
        randomBytes(4).toString("hex"),
      author_name: authorName,
      body,
      created_at: new Date().toISOString(),
    };

    data.comments.push(newComment);
    saveData(data);

    return newComment;
  },

  getCoupon(code: string): Coupon | undefined {
    const data = loadData();

    return data.coupons.find(
      (coupon) => coupon.code.toUpperCase() === code.toUpperCase()
    );
  },

  redeemCoupon(
    userId: string,
    code: string,
    discountCredits: number
  ): {
    success: boolean;
    credits: number;
    coupon: Coupon;
  } {
    const data = loadData();

    const coupon = data.coupons.find(
      (item) => item.code.toUpperCase() === code.toUpperCase()
    );

    const user = data.users.find(
      (item) => item.id === userId
    );

    if (!coupon || !user) {
      throw new Error("Invalid coupon or user");
    }

    if (
      coupon.used_count >= coupon.max_uses ||
      coupon.redeemed_by.includes(userId)
    ) {
      throw new Error("Coupon is no longer available");
    }

    if (discountCredits !== coupon.discount_credits) {
      throw new Error("Invalid coupon discount");
    }

    coupon.used_count += 1;
    coupon.redeemed_by.push(userId);
    user.credits += coupon.discount_credits;

    saveData(data);

    return {
      success: true,
      credits: user.credits,
      coupon,
    };
  },
};
