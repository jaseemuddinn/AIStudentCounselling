import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                try {
                    await connectDB();

                    // Find user with password field
                    const user = await User.findOne({ email: credentials.email }).select('+password');

                    if (!user) {
                        throw new Error('Invalid email or password');
                    }

                    if (!user.isActive) {
                        throw new Error('Account is deactivated');
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        throw new Error('Invalid email or password');
                    }

                    // Return user object (without password)
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }

            // Update session
            if (trigger === 'update' && session) {
                token.name = session.name;
                token.picture = session.image;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    // Required for NextAuth v5 in production (Vercel, Netlify, etc.)
    trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
