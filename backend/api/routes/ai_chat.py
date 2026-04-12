from fastapi import APIRouter, HTTPException
from models.schemas import AIMessage, AIResponse, ChatContext
from groq import Groq
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
from typing import Dict, List

load_dotenv()

router = APIRouter()

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Store conversation history and context (in production, use Redis or database)
conversations: Dict[str, List[dict]] = {}
user_contexts: Dict[str, dict] = {}

# Professional Consulting System Prompt
SYSTEM_PROMPT = """أنت مستشار أعمال محترف في منصة SCK للاستشارات الإدارية.

🎯 دورك:
- مستشار أعمال خبير (ليس مساعد عادي)
- تقدم استشارات احترافية للشركات في مصر والسعودية
- تستخدم أطر عمل استشارية معروفة (SWOT, KPIs, SMART Goals)
- تطرح أسئلة تشخيصية ذكية قبل تقديم النصائح

📋 مجالات خبرتك:
1. الاستشارات الإدارية (تحليل السوق، نمذجة الأعمال، استراتيجيات النمو)
2. استشارات الموارد البشرية (التوظيف، تقييم الأداء، التدريب)
3. التطوير التنظيمي (تحسين العمليات، الهيكل التنظيمي)
4. التخطيط الاستراتيجي (الرؤية، الأهداف، مؤشرات الأداء)

🎨 أسلوبك:
- محترف وواثق (ليس روبوتياً)
- واضح ومنظم (استخدم النقاط والخطوات)
- عملي وقابل للتطبيق
- تطرح أسئلة قبل تقديم الحلول

📊 منهجية العمل:
1. اسأل عن: نوع العمل، حجم الشركة، المشكلة الحالية، الأهداف
2. حلل الموقف باستخدام أطر عمل استشارية
3. قدم نصائح منظمة (3-5 نقاط)
4. اقترح خطوات عملية
5. وجّه نحو حجز استشارة مع SCK

🎯 دائماً:
- استخدم أطر عمل معروفة (SWOT، KPIs، SMART)
- قدم أمثلة من السوق المصري/السعودي
- اختم بدعوة لحجز استشارة أو التواصل مع فريق SCK

⚠️ مهم:
- لا تقدم نصائح عامة، كن محدداً
- اطرح أسئلة تشخيصية قبل الإجابة
- استخدم لغة احترافية (ليست عامية)
- ركز على القيمة والنتائج"""

# Quick reply templates
QUICK_REPLIES = {
    "improve_sales": "أريد تحسين المبيعات",
    "hire_better": "كيف أوظف موظفين أفضل؟",
    "build_strategy": "أحتاج بناء استراتيجية",
    "optimize_operations": "تحسين العمليات التشغيلية",
    "book_consultation": "أريد حجز استشارة"
}

# Consulting frameworks
FRAMEWORKS = {
    "swot": """
📊 تحليل SWOT:
• نقاط القوة (Strengths)
• نقاط الضعف (Weaknesses)
• الفرص (Opportunities)
• التهديدات (Threats)
""",
    "smart": """
🎯 أهداف SMART:
• محددة (Specific)
• قابلة للقياس (Measurable)
• قابلة للتحقيق (Achievable)
• ذات صلة (Relevant)
• محددة بوقت (Time-bound)
""",
    "kpi": """
📈 مؤشرات الأداء الرئيسية (KPIs):
• مؤشرات مالية
• مؤشرات العملاء
• مؤشرات العمليات
• مؤشرات النمو
"""
}

def detect_intent(message: str) -> str:
    """Detect user intent from message"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ["مبيعات", "بيع", "sales", "revenue"]):
        return "sales"
    elif any(word in message_lower for word in ["توظيف", "موظفين", "hire", "recruitment"]):
        return "hr"
    elif any(word in message_lower for word in ["استراتيجية", "strategy", "خطة", "plan"]):
        return "strategy"
    elif any(word in message_lower for word in ["عمليات", "operations", "تحسين", "optimize"]):
        return "operations"
    elif any(word in message_lower for word in ["حجز", "استشارة", "book", "consultation"]):
        return "booking"
    else:
        return "general"

def get_diagnostic_questions(intent: str, context: dict) -> str:
    """Get diagnostic questions based on intent and context"""
    
    # Check what info we already have
    has_industry = context.get("industry")
    has_size = context.get("company_size")
    has_problem = context.get("problem")
    
    if not has_industry:
        return "لكي أساعدك بشكل أفضل، أخبرني: في أي مجال تعمل شركتك؟"
    
    if not has_size:
        return "ممتاز! كم عدد الموظفين في شركتك تقريباً؟"
    
    if not has_problem:
        return "فهمت. ما هو التحدي الأكبر الذي تواجهه حالياً؟"
    
    return None

def extract_context(message: str, current_context: dict) -> dict:
    """Extract business context from user message"""
    message_lower = message.lower()
    
    # Extract industry
    industries = {
        "تجارة": "retail", "تقنية": "tech", "تعليم": "education",
        "صحة": "healthcare", "عقارات": "real estate", "مطاعم": "food"
    }
    for ar, en in industries.items():
        if ar in message_lower:
            current_context["industry"] = en
    
    # Extract company size
    if any(word in message_lower for word in ["صغيرة", "ناشئة", "startup"]):
        current_context["company_size"] = "small"
    elif any(word in message_lower for word in ["متوسطة", "medium"]):
        current_context["company_size"] = "medium"
    elif any(word in message_lower for word in ["كبيرة", "large"]):
        current_context["company_size"] = "large"
    
    return current_context

def build_enhanced_prompt(message: str, context: dict, intent: str) -> str:
    """Build enhanced prompt with context"""
    context_str = ""
    
    if context.get("industry"):
        context_str += f"\nالصناعة: {context['industry']}"
    if context.get("company_size"):
        context_str += f"\nحجم الشركة: {context['company_size']}"
    if context.get("problem"):
        context_str += f"\nالمشكلة: {context['problem']}"
    
    enhanced_prompt = f"""السياق:{context_str}

نوع الاستفسار: {intent}

رسالة المستخدم: {message}

قدم استشارة احترافية منظمة مع:
1. تحليل الموقف
2. نصائح عملية (3-5 نقاط)
3. خطوات تنفيذية
4. دعوة لحجز استشارة مع SCK"""
    
    return enhanced_prompt

@router.post("/chat", response_model=AIResponse)
async def chat_with_ai(message: AIMessage):
    """Intelligent chat with AI business consultant"""
    try:
        # Get or create conversation
        conv_id = message.conversation_id or str(uuid.uuid4())
        
        if conv_id not in conversations:
            conversations[conv_id] = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
            user_contexts[conv_id] = {
                "created_at": datetime.now().isoformat(),
                "message_count": 0
            }
        
        # Update context
        user_contexts[conv_id]["message_count"] += 1
        user_contexts[conv_id] = extract_context(message.message, user_contexts[conv_id])
        
        # Detect intent
        intent = detect_intent(message.message)
        user_contexts[conv_id]["last_intent"] = intent
        
        # Check if we need diagnostic questions
        diagnostic_q = get_diagnostic_questions(intent, user_contexts[conv_id])
        
        if diagnostic_q and user_contexts[conv_id]["message_count"] <= 3:
            # Ask diagnostic question instead of calling AI
            ai_message = diagnostic_q
        else:
            # Build enhanced prompt with context
            enhanced_message = build_enhanced_prompt(
                message.message,
                user_contexts[conv_id],
                intent
            )
            
            # Add user message
            conversations[conv_id].append({
                "role": "user",
                "content": enhanced_message
            })
            
            # Get AI response using Groq
            chat_completion = groq_client.chat.completions.create(
                messages=conversations[conv_id],
                model="llama-3.1-70b-versatile",  # Fast and intelligent
                temperature=0.7,
                max_tokens=800,
                top_p=0.9
            )
            
            ai_message = chat_completion.choices[0].message.content
            
            # Add AI response to conversation
            conversations[conv_id].append({
                "role": "assistant",
                "content": ai_message
            })
        
        # Generate quick replies based on context
        quick_replies = []
        if intent == "general":
            quick_replies = [
                "تحسين المبيعات",
                "استشارات الموارد البشرية",
                "بناء استراتيجية",
                "حجز استشارة"
            ]
        elif intent in ["sales", "hr", "strategy", "operations"]:
            quick_replies = [
                "أخبرني المزيد",
                "ما الخطوات التالية؟",
                "حجز استشارة مع خبير"
            ]
        
        return AIResponse(
            response=ai_message,
            conversation_id=conv_id,
            intent=intent,
            quick_replies=quick_replies,
            context=user_contexts[conv_id]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in AI chat: {str(e)}")

@router.get("/chat/{conversation_id}/context")
async def get_conversation_context(conversation_id: str):
    """Get conversation context and history"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation_id": conversation_id,
        "context": user_contexts.get(conversation_id, {}),
        "message_count": len(conversations[conversation_id]) - 1,  # Exclude system message
        "created_at": user_contexts.get(conversation_id, {}).get("created_at")
    }

@router.delete("/chat/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear conversation history"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        if conversation_id in user_contexts:
            del user_contexts[conversation_id]
        return {"success": True, "message": "تم مسح المحادثة"}
    return {"success": False, "message": "المحادثة غير موجودة"}

@router.get("/quick-replies")
async def get_quick_replies():
    """Get predefined quick reply options"""
    return {
        "success": True,
        "quick_replies": [
            {"id": "improve_sales", "text": "تحسين المبيعات", "icon": "📈"},
            {"id": "hire_better", "text": "توظيف أفضل", "icon": "👥"},
            {"id": "build_strategy", "text": "بناء استراتيجية", "icon": "🎯"},
            {"id": "optimize_operations", "text": "تحسين العمليات", "icon": "⚙️"},
            {"id": "book_consultation", "text": "حجز استشارة", "icon": "📅"}
        ]
    }

@router.get("/frameworks")
async def get_consulting_frameworks():
    """Get consulting frameworks"""
    return {
        "success": True,
        "frameworks": FRAMEWORKS
    }
