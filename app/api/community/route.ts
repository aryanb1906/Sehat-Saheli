import { NextRequest, NextResponse } from "next/server";

interface SupportGroup {
    id: string;
    name: string;
    topic: string; // "first-trimester", "second-trimester", "third-trimester", "labor-prep", "postpartum"
    memberCount: number;
    createdAt: string;
    isActive: boolean;
    lastActivityDate: string;
}

interface SuccessStory {
    id: string;
    motherName: string;
    pregnancyWeek: number;
    story: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    postedAt: string;
    isAnonymous: boolean;
}

interface ExpertQA {
    id: string;
    question: string;
    askerName: string;
    doctorName: string;
    answer?: string;
    status: "pending" | "answered";
    askedAt: string;
    answeredAt?: string;
    likes: number;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "support-groups", "success-stories", "qa"

        if (type === "support-groups") {
            return getSupportGroups();
        } else if (type === "success-stories") {
            return getSuccessStories();
        } else if (type === "qa") {
            return getExpertQA();
        }

        return NextResponse.json(
            { error: "Invalid query type" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch community data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, data } = body;

        if (action === "create-group") {
            return createSupportGroup(data);
        } else if (action === "post-story") {
            return postSuccessStory(data);
        } else if (action === "ask-question") {
            return postQuestion(data);
        } else if (action === "join-group") {
            return joinGroup(data);
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to process community action" },
            { status: 500 }
        );
    }
}

function getSupportGroups(): Response {
    const groups: SupportGroup[] = [
        {
            id: "group_001",
            name: "First Trimester Warriors",
            topic: "first-trimester",
            memberCount: 342,
            createdAt: "2024-01-15",
            isActive: true,
            lastActivityDate: "2024-03-22",
        },
        {
            id: "group_002",
            name: "Healthy Third Trimester",
            topic: "third-trimester",
            memberCount: 289,
            createdAt: "2024-01-10",
            isActive: true,
            lastActivityDate: "2024-03-22",
        },
        {
            id: "group_003",
            name: "Labor & Delivery Prep",
            topic: "labor-prep",
            memberCount: 156,
            createdAt: "2024-02-01",
            isActive: true,
            lastActivityDate: "2024-03-21",
        },
        {
            id: "group_004",
            name: "Postpartum Support Circle",
            topic: "postpartum",
            memberCount: 198,
            createdAt: "2024-02-10",
            isActive: true,
            lastActivityDate: "2024-03-22",
        },
    ];

    return NextResponse.json({
        success: true,
        groups,
        totalGroups: groups.length,
    });
}

function getSuccessStories(): Response {
    const stories: SuccessStory[] = [
        {
            id: "story_001",
            motherName: "Priya (Month 9)",
            pregnancyWeek: 36,
            story:
                "After years of trying, I'm finally here! Sehat Saheli helped me stay calm and informed. The ASHA worker support was incredible!",
            likes: 234,
            comments: 45,
            postedAt: "2024-03-20",
            isAnonymous: false,
        },
        {
            id: "story_002",
            motherName: "Anonymous",
            pregnancyWeek: 20,
            story:
                "Overcoming gestational diabetes was tough, but the nutrition tips and AI guidance made it manageable. Grateful for this app!",
            likes: 189,
            comments: 32,
            postedAt: "2024-03-18",
            isAnonymous: true,
        },
        {
            id: "story_003",
            motherName: "Sneha (New Mom)",
            pregnancyWeek: 0,
            story:
                "Just delivered a healthy baby girl! The kick counter that alerted me to low movement was a lifesaver. Thank you Sehat Saheli!",
            likes: 567,
            comments: 89,
            postedAt: "2024-03-15",
            isAnonymous: false,
        },
    ];

    return NextResponse.json({
        success: true,
        stories,
        totalStories: stories.length,
    });
}

function getExpertQA(): Response {
    const qaList: ExpertQA[] = [
        {
            id: "qa_001",
            question: "Is it safe to exercise during pregnancy?",
            askerName: "Anjali",
            doctorName: "Dr. Rajesh Kumar",
            answer:
                "Yes, moderate exercise is beneficial. Walking, yoga, and swimming are safe. Avoid high-impact activities. Consult your doctor before starting.",
            status: "answered",
            askedAt: "2024-03-10",
            answeredAt: "2024-03-11",
            likes: 176,
        },
        {
            id: "qa_002",
            question: "What should I eat to prevent gestational diabetes?",
            askerName: "Neha",
            doctorName: "Dr. Priya Singh",
            answer:
                "Focus on whole grains, lean proteins, vegetables. Avoid sugary drinks and processed foods. Small frequent meals help maintain blood sugar.",
            status: "answered",
            askedAt: "2024-03-15",
            answeredAt: "2024-03-16",
            likes: 342,
        },
        {
            id: "qa_003",
            question: "How to manage stress during pregnancy?",
            askerName: "Anonymous",
            doctorName: "Dr. Counselor",
            status: "pending",
            askedAt: "2024-03-20",
            likes: 45,
        },
    ];

    return NextResponse.json({
        success: true,
        questions: qaList,
        totalQuestions: qaList.length,
    });
}

function createSupportGroup(data: any): Response {
    const { name, topic, creator } = data;

    const newGroup: SupportGroup = {
        id: `group_${Date.now()}`,
        name,
        topic,
        memberCount: 1,
        createdAt: new Date().toISOString().split("T")[0],
        isActive: true,
        lastActivityDate: new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({
        success: true,
        message: "Support group created successfully",
        group: newGroup,
    });
}

function postSuccessStory(data: any): Response {
    const { motherName, story, isAnonymous } = data;

    const newStory: SuccessStory = {
        id: `story_${Date.now()}`,
        motherName: isAnonymous ? "Anonymous" : motherName,
        pregnancyWeek: 0,
        story,
        likes: 0,
        comments: 0,
        postedAt: new Date().toISOString().split("T")[0],
        isAnonymous,
    };

    return NextResponse.json({
        success: true,
        message: "Success story posted! Thank you for inspiring others.",
        story: newStory,
    });
}

function postQuestion(data: any): Response {
    const { question, askerName } = data;

    const newQuestion: ExpertQA = {
        id: `qa_${Date.now()}`,
        question,
        askerName,
        doctorName: "Awaiting doctor response",
        status: "pending",
        askedAt: new Date().toISOString().split("T")[0],
        likes: 0,
    };

    return NextResponse.json({
        success: true,
        message:
            "Question posted! An expert doctor will answer within 24 hours.",
        question: newQuestion,
    });
}

function joinGroup(data: any): Response {
    const { groupId, userId } = data;

    return NextResponse.json({
        success: true,
        message: "Successfully joined the support group!",
        groupId,
    });
}
