from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from pymongo import MongoClient
from datetime import datetime
import json
import uuid
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
import time
import re
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini AI configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found in environment variables!")
    print("Please set your Gemini API key in .env file")
else:
    print(f"🤖 Using Gemini AI with API key: {GEMINI_API_KEY[:10]}...")

client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client.personalized_tutor

@dataclass
class LearnerProfile:
    id: str
    name: str
    learning_style: str
    knowledge_level: int
    subject: str
    weak_areas: List[str]
    created_at: datetime

@dataclass
class LearningResource:
    id: str
    title: str
    type: str
    content_url: str
    difficulty_level: int
    learning_style: str
    topic: str
    prerequisites: List[str]

@dataclass
class LearningPath:
    id: str
    learner_id: str
    resources: List[str]
    current_position: int
    progress: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

@dataclass
class QuizQuestion:
    id: str
    question: str
    options: List[str]
    correct_answer: str
    topic: str
    difficulty_level: int
    resource_id: str

def clean_mongo_doc(doc):
    if doc and '_id' in doc:
        del doc['_id']
    return doc

class GeminiClient:
    def __init__(self, api_key: str = GEMINI_API_KEY):
        self.api_key = api_key
        self.base_url = GEMINI_BASE_URL
        
    def generate(self, prompt: str, max_tokens: int = 2048) -> str:
        """Generate text using Gemini AI API"""
        try:
            url = f"{self.base_url}?key={self.api_key}"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": max_tokens,
                    "topP": 0.8,
                    "topK": 40
                }
            }
            
            print(f"🤖 Sending request to Gemini AI...")
            response = requests.post(
                url, 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            response.raise_for_status()
            
            result = response.json()
            
            if 'candidates' in result and len(result['candidates']) > 0:
                if 'content' in result['candidates'][0]:
                    if 'parts' in result['candidates'][0]['content']:
                        return result['candidates'][0]['content']['parts'][0]['text']
            
            print(f"❌ Unexpected Gemini response format: {result}")
            return ""
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Gemini request error: {e}")
            raise Exception(f"Failed to connect to Gemini AI: {e}")
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            raise Exception(f"Gemini generation failed: {e}")

class ContentGeneratorAgent:
    """AI Agent for generating educational content using Gemini AI"""
    
    def __init__(self):
        self.gemini = GeminiClient()
        self.agent_name = "ContentGenerator"
        self.system_context = """You are an expert educational content generator. 
        Your role is to create high-quality learning materials, quizzes, and analyze learning patterns."""
        
    def generate_quiz_questions(self, topic: str, difficulty: int, count: int = 5) -> List[QuizQuestion]:
        """Generate quiz questions using Gemini AI"""
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                print(f"🤖 Generating {count} questions for topic: {topic}, difficulty: {difficulty}/5 (attempt {retry_count + 1})")
                
                prompt = f"""{self.system_context}

TASK: Create exactly {count} multiple choice questions about {topic} at difficulty level {difficulty} out of 5.

REQUIREMENTS:
- Each question must have exactly 4 options
- Difficulty level {difficulty}/5 where 1=beginner, 5=expert
- Focus specifically on {topic}
- Return ONLY valid JSON format
- Make questions educational and accurate
- Ensure one correct answer per question

FORMAT (return exactly this structure):
[
  {{
    "question": "What is the main concept of {topic}?",
    "options": ["Correct Answer", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
    "correct_answer": "Correct Answer",
    "topic": "{topic}"
  }}
]

Create {count} questions about {topic} now. Return only the JSON array without any additional text or formatting:"""
                
                response_text = self.gemini.generate(prompt, max_tokens=2048)
                
                if not response_text:
                    raise Exception("Empty response from Gemini AI")
                
                print(f"📥 Raw Gemini response: {response_text[:300]}...")
                
                # Clean the response
                response_text = self._clean_json_response(response_text)
                
                # Parse JSON
                questions_data = json.loads(response_text)
                
                if not isinstance(questions_data, list):
                    raise ValueError("Response is not a JSON array")
                
                # Take only the requested number of questions
                questions_data = questions_data[:count]
                
                questions = []
                for i, q_data in enumerate(questions_data):
                    # Validate question structure
                    required_fields = ['question', 'options', 'correct_answer']
                    if not all(field in q_data for field in required_fields):
                        print(f"⚠️ Question {i+1} missing fields, skipping")
                        continue
                    
                    if not isinstance(q_data['options'], list) or len(q_data['options']) < 4:
                        print(f"⚠️ Question {i+1} invalid options, skipping")
                        continue
                    
                    # Ensure we have exactly 4 options
                    options = q_data['options'][:4]
                    
                    # Make sure correct answer is in options
                    correct_answer = q_data['correct_answer']
                    if correct_answer not in options:
                        # Use the first option as correct answer
                        correct_answer = options[0]
                    
                    question = QuizQuestion(
                        id=str(uuid.uuid4()),
                        question=q_data['question'],
                        options=options,
                        correct_answer=correct_answer,
                        topic=q_data.get('topic', topic),
                        difficulty_level=difficulty,
                        resource_id=""
                    )
                    questions.append(question)
                
                if len(questions) >= count:
                    questions = questions[:count]
                    print(f"✅ Successfully generated {len(questions)} questions")
                    return questions
                else:
                    raise ValueError(f"Generated only {len(questions)} valid questions, need {count}")
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing error (attempt {retry_count + 1}): {e}")
                print(f"Response text: {response_text}")
                retry_count += 1
                time.sleep(2)
                
            except Exception as e:
                print(f"❌ Error generating questions (attempt {retry_count + 1}): {e}")
                retry_count += 1
                time.sleep(2)
        
        # If all retries failed, generate simple questions
        print("⚠️ Gemini AI failed, generating basic questions")
        return self._generate_basic_questions(topic, difficulty, count)
    
    def _clean_json_response(self, response_text: str) -> str:
        """Clean the Gemini response to extract valid JSON"""
        
        # Remove markdown code blocks if present
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*', '', response_text)
        
        # Find JSON array boundaries
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']')
        
        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            json_content = response_text[start_idx:end_idx + 1]
        else:
            # Try to find individual objects and wrap in array
            objects = []
            lines = response_text.split('\n')
            current_object = ""
            brace_count = 0
            
            for line in lines:
                if '{' in line:
                    current_object = line
                    brace_count = line.count('{') - line.count('}')
                elif current_object and brace_count > 0:
                    current_object += " " + line
                    brace_count += line.count('{') - line.count('}')
                    
                    if brace_count == 0:
                        try:
                            obj = json.loads(current_object)
                            objects.append(obj)
                            current_object = ""
                        except:
                            current_object = ""
                            brace_count = 0
            
            if objects:
                json_content = json.dumps(objects)
            else:
                json_content = response_text
        
        return json_content
    
    def _generate_basic_questions(self, topic: str, difficulty: int, count: int) -> List[QuizQuestion]:
        """Generate basic questions when Gemini AI fails"""
        questions = []
        
        question_templates = {
            'algebra': [
                ("What is a variable in algebra?", ["A letter representing an unknown", "A constant number", "An operation", "A graph"]),
                ("How do you solve x + 5 = 10?", ["Subtract 5 from both sides", "Add 5 to both sides", "Multiply by 5", "Divide by 5"]),
                ("What is a linear equation?", ["An equation with degree 1", "An equation with degree 2", "A curved line", "A circle"]),
                ("What does 'like terms' mean?", ["Terms with same variables and powers", "Any two numbers", "Equal signs", "Multiplication terms"]),
                ("What is the order of operations?", ["PEMDAS/BODMAS", "Left to right always", "Addition first", "Random order"]),
            ],
            'calculus': [
                ("What is a limit?", ["Value a function approaches", "Maximum value", "Minimum value", "Average value"]),
                ("What is a derivative?", ["Rate of change", "Area under curve", "Maximum point", "Minimum point"]),
                ("What is integration?", ["Finding area under curve", "Finding slope", "Finding maximum", "Finding minimum"]),
                ("What does continuity mean?", ["No breaks in function", "Always increasing", "Always positive", "Has a maximum"]),
                ("What is the fundamental theorem?", ["Links derivatives and integrals", "States all functions continuous", "Proves limits exist", "Shows functions are smooth"]),
            ],
            'geometry': [
                ("Sum of angles in a triangle?", ["180 degrees", "360 degrees", "90 degrees", "270 degrees"]),
                ("Area of a rectangle?", ["length × width", "2(length + width)", "length + width", "length²"]),
                ("What is a right angle?", ["90 degrees", "180 degrees", "45 degrees", "60 degrees"]),
                ("What is the Pythagorean theorem?", ["a² + b² = c²", "a + b = c", "a × b = c", "a² = b² + c²"]),
                ("How many sides does a hexagon have?", ["6", "5", "7", "8"]),
            ],
            'trigonometry': [
                ("What is sine in a right triangle?", ["opposite/hypotenuse", "adjacent/hypotenuse", "opposite/adjacent", "hypotenuse/opposite"]),
                ("What is cosine in a right triangle?", ["adjacent/hypotenuse", "opposite/hypotenuse", "opposite/adjacent", "hypotenuse/adjacent"]),
                ("What is tangent in a right triangle?", ["opposite/adjacent", "adjacent/opposite", "opposite/hypotenuse", "adjacent/hypotenuse"]),
                ("What is the unit circle?", ["Circle with radius 1", "Circle with radius 2", "Any circle", "Circle with diameter 1"]),
                ("What is the period of sin(x)?", ["2π", "π", "π/2", "4π"]),
            ]
        }
        
        templates = question_templates.get(topic.lower(), question_templates['algebra'])
        
        for i in range(min(count, len(templates))):
            question_text, options = templates[i]
            question = QuizQuestion(
                id=str(uuid.uuid4()),
                question=question_text,
                options=options,
                correct_answer=options[0],  # First option is correct
                topic=topic,
                difficulty_level=difficulty,
                resource_id=""
            )
            questions.append(question)
        
        # If we need more questions, repeat with variations
        while len(questions) < count:
            template_idx = len(questions) % len(templates)
            question_text, options = templates[template_idx]
            question = QuizQuestion(
                id=str(uuid.uuid4()),
                question=f"Advanced: {question_text}",
                options=options,
                correct_answer=options[0],
                topic=topic,
                difficulty_level=difficulty,
                resource_id=""
            )
            questions.append(question)
        
        return questions[:count]
    
    def analyze_weak_areas(self, quiz_results: List[Dict]) -> List[str]:
        """Analyze quiz results to identify weak areas using Gemini AI"""
        try:
            if not quiz_results:
                return []
            
            prompt = f"""{self.system_context}

TASK: Analyze quiz results and identify weak learning areas.

Quiz Results:
{json.dumps(quiz_results, indent=2)}

Based on incorrect answers and topics, identify the main weak areas that need attention.
Return only a JSON array of weak area topics (maximum 5 topics).

Example format: ["algebra", "geometry", "calculus"]

Return only the JSON array without any additional text:"""
            
            response = self.gemini.generate(prompt, max_tokens=500)
            
            # Try to extract JSON array
            try:
                start = response.find('[')
                end = response.rfind(']')
                if start != -1 and end != -1:
                    weak_areas = json.loads(response[start:end+1])
                    return weak_areas if isinstance(weak_areas, list) else []
            except:
                pass
            
            # Fallback to simple analysis
            incorrect_topics = []
            for result in quiz_results:
                if not result.get('is_correct', False):
                    topic = result.get('topic', '').lower()
                    if topic:
                        incorrect_topics.append(topic)
            return list(set(incorrect_topics))
            
        except Exception as e:
            print(f"❌ Error analyzing weak areas: {e}")
            # Fallback analysis
            incorrect_topics = []
            for result in quiz_results:
                if not result.get('is_correct', False):
                    topic = result.get('topic', '').lower()
                    if topic:
                        incorrect_topics.append(topic)
            return list(set(incorrect_topics))

class PathGeneratorAgent:
    """AI Agent for generating personalized learning paths using Gemini AI"""
    
    def __init__(self):
        self.gemini = GeminiClient()
        self.agent_name = "PathGenerator"
        self.system_context = """You are an AI learning path optimization specialist. 
        Your role is to create optimal learning sequences based on learner profiles and available resources."""
        
    def generate_learning_path(self, learner_profile: LearnerProfile, available_resources: List[LearningResource]) -> List[str]:
        """Generate personalized learning path using Gemini AI"""
        
        print(f"🛤️ Generating learning path for learner: {learner_profile.name}")
        print(f"Learning style: {learner_profile.learning_style}")
        print(f"Weak areas: {learner_profile.weak_areas}")
        print(f"Knowledge level: {learner_profile.knowledge_level}")
        print(f"Subject: {learner_profile.subject}")
        print(f"Available resources: {len(available_resources)}")
        
        if not available_resources:
            raise Exception("No learning resources available")
        
        try:
            # Use Gemini AI to generate learning path
            resource_list = []
            for resource in available_resources:
                resource_list.append(f"ID: {resource.id}, Title: {resource.title}, Topic: {resource.topic}, Difficulty: {resource.difficulty_level}, Style: {resource.learning_style}, Type: {resource.type}")
            
            prompt = f"""{self.system_context}

TASK: Create an optimal learning sequence for this learner.

LEARNER PROFILE:
- Name: {learner_profile.name}
- Learning Style: {learner_profile.learning_style}
- Subject: {learner_profile.subject}
- Knowledge Level: {learner_profile.knowledge_level}/5
- Weak Areas: {learner_profile.weak_areas}

AVAILABLE RESOURCES:
{chr(10).join(resource_list)}

OPTIMIZATION CRITERIA:
1. Prioritize learning style: {learner_profile.learning_style}
2. Focus on weak areas: {learner_profile.weak_areas}
3. Start with difficulty level {learner_profile.knowledge_level} or lower
4. Progress logically through prerequisites
5. Ensure smooth difficulty progression
6. Select 6-8 resources maximum

Return only a JSON array of resource IDs in optimal learning order:
["resource_id_1", "resource_id_2", "resource_id_3"]

Return only the JSON array without any additional text:"""
            
            print("🤖 Asking Gemini AI to generate learning path...")
            response = self.gemini.generate(prompt, max_tokens=1000)
            
            # Try to extract JSON from response
            json_match = re.search(r'\[.*?\]', response, re.DOTALL)
            if json_match:
                try:
                    path_ids = json.loads(json_match.group())
                    
                    # Validate resource IDs
                    valid_ids = [r.id for r in available_resources]
                    filtered_path = [rid for rid in path_ids if rid in valid_ids]
                    
                    if filtered_path and len(filtered_path) >= 3:
                        print(f"✅ Generated AI learning path: {filtered_path}")
                        return filtered_path
                except json.JSONDecodeError:
                    pass
            
            # Fallback to manual generation
            print("⚠️ AI path generation failed, using manual approach")
            return self._manual_path_generation(learner_profile, available_resources)
            
        except Exception as e:
            print(f"❌ Error with Gemini path generation: {e}")
            return self._manual_path_generation(learner_profile, available_resources)
    
    def _manual_path_generation(self, learner_profile: LearnerProfile, available_resources: List[LearningResource]) -> List[str]:
        """Manual path generation logic"""
        print("🔧 Using manual path generation")
        
        # Filter by learning style preference
        preferred = [r for r in available_resources if r.learning_style == learner_profile.learning_style]
        universal = [r for r in available_resources if r.learning_style == 'universal']
        other = [r for r in available_resources if r not in preferred and r not in universal]
        
        # Combine in order of preference
        filtered_resources = preferred + universal + other
        
        # Sort by difficulty
        sorted_resources = sorted(filtered_resources, key=lambda x: x.difficulty_level)
        
        # Build path
        path = []
        
        # Add resources for weak areas first
        for weak_area in learner_profile.weak_areas:
            weak_area_resources = [r for r in sorted_resources 
                                 if weak_area.lower() in r.topic.lower() and r.id not in path]
            path.extend([r.id for r in weak_area_resources[:2]])
        
        # Fill with appropriate difficulty level resources
        knowledge_level = int(learner_profile.knowledge_level)
        remaining = [r for r in sorted_resources 
                    if r.id not in path and r.difficulty_level <= knowledge_level + 1]
        path.extend([r.id for r in remaining[:6-len(path)]])
        
        # Add any remaining if needed
        if len(path) < 4:
            remaining = [r.id for r in sorted_resources if r.id not in path]
            path.extend(remaining[:4-len(path)])
        
        return path[:8]

class EvaluatorAgent:
    """AI Agent for evaluating quiz responses and providing feedback using Gemini AI"""
    
    def __init__(self):
        self.gemini = GeminiClient()
        self.agent_name = "QuizEvaluator"
        self.system_context = """You are an educational assessment expert. 
        Your role is to evaluate quiz responses and provide constructive, encouraging feedback."""
    
    def evaluate_quiz_response(self, question: QuizQuestion, user_answer: str) -> Dict[str, Any]:
        """Evaluate quiz response using Gemini AI"""
        
        is_correct = user_answer.strip().lower() == question.correct_answer.strip().lower()
        
        try:
            prompt = f"""{self.system_context}

TASK: Provide educational feedback for this quiz question.

QUESTION: {question.question}
OPTIONS: {', '.join(question.options)}
CORRECT ANSWER: {question.correct_answer}
USER ANSWER: {user_answer}
RESULT: {'CORRECT' if is_correct else 'INCORRECT'}

Write helpful, encouraging feedback (2-3 sentences) that:
1. Explains why the answer is correct/incorrect
2. Provides a learning tip or concept explanation
3. Encourages continued learning

Keep the tone positive and educational. Return only the feedback text without any additional formatting:"""
            
            response = self.gemini.generate(prompt, max_tokens=300)
            feedback = response.strip() if response else f"Your answer is {'correct' if is_correct else 'incorrect'}."
            
        except Exception as e:
            print(f"❌ Error generating feedback: {e}")
            feedback = f"Your answer is {'correct' if is_correct else 'incorrect'}. The correct answer is {question.correct_answer}."
        
        return {
            'is_correct': is_correct,
            'feedback': feedback,
            'topic': question.topic,
            'score': 100 if is_correct else 0
        }
    
    def generate_overall_feedback(self, quiz_results: List[Dict]) -> Dict[str, Any]:
        """Generate overall feedback for quiz performance using Gemini AI"""
        if not quiz_results:
            return {
                'average_score': 0,
                'total_questions': 0,
                'correct_answers': 0,
                'weak_topics': [],
                'strong_topics': [],
                'recommendation': 'No quiz data available'
            }
        
        total_score = sum(r.get('score', 0) for r in quiz_results)
        average_score = total_score / len(quiz_results)
        
        weak_topics = [r['topic'] for r in quiz_results if not r.get('is_correct', False)]
        strong_topics = [r['topic'] for r in quiz_results if r.get('is_correct', False)]
        
        try:
            prompt = f"""{self.system_context}

TASK: Provide an encouraging recommendation based on quiz performance.

PERFORMANCE DATA:
- Score: {average_score:.1f}%
- Correct: {len(strong_topics)}/{len(quiz_results)}
- Strong areas: {list(set(strong_topics))}
- Areas to improve: {list(set(weak_topics))}

Write an encouraging 1-2 sentence recommendation that:
1. Acknowledges their effort
2. Provides specific guidance for improvement
3. Motivates continued learning

Return only the recommendation text without any additional formatting:"""
            
            response = self.gemini.generate(prompt, max_tokens=200)
            recommendation = response.strip() if response else (
                'Great job! Keep up the good work!' if average_score >= 70 else 'Keep practicing to improve your understanding!'
            )
            
        except Exception as e:
            print(f"❌ Error generating recommendation: {e}")
            recommendation = 'Great job! Keep up the good work!' if average_score >= 70 else 'Keep practicing to improve!'
        
        return {
            'average_score': average_score,
            'total_questions': len(quiz_results),
            'correct_answers': len(strong_topics),
            'weak_topics': list(set(weak_topics)),
            'strong_topics': list(set(strong_topics)),
            'recommendation': recommendation
        }

class AgentOrchestrator:
    """Orchestrates all AI agents for coordinated learning experience"""
    
    def __init__(self):
        self.content_agent = ContentGeneratorAgent()
        self.path_agent = PathGeneratorAgent()
        self.evaluator_agent = EvaluatorAgent()
        print("✅ Initialized AI Agent Orchestrator with Gemini AI")
    
    def process_new_learner(self, profile_data: Dict) -> Dict[str, Any]:
        # Ensure knowledge_level is an integer
        knowledge_level = profile_data.get('knowledge_level', 1)
        if isinstance(knowledge_level, str):
            try:
                knowledge_level = int(knowledge_level)
            except (ValueError, TypeError):
                knowledge_level = 1
        
        # Ensure weak_areas is a list
        weak_areas = profile_data.get('weak_areas', [])
        if not isinstance(weak_areas, list):
            weak_areas = []
        
        # Create learner profile
        profile = LearnerProfile(
            id=str(uuid.uuid4()),
            name=str(profile_data['name']),
            learning_style=str(profile_data['learning_style']),
            knowledge_level=knowledge_level,
            subject=str(profile_data['subject']),
            weak_areas=weak_areas,
            created_at=datetime.utcnow()
        )
        
        # Save profile to database
        db.learner_profiles.insert_one(asdict(profile))
        print(f"✅ Created learner profile: {profile.id}")
        
        # Get available resources
        resources = list(db.learning_resources.find({}, {'_id': 0}))
        resource_objects = [LearningResource(**r) for r in resources]
        print(f"📚 Found {len(resource_objects)} resources")
        
        # Generate learning path
        path_resources = self.path_agent.generate_learning_path(profile, resource_objects)
        
        if not path_resources:
            raise Exception("Failed to generate learning path")
        
        # Create learning path
        learning_path = LearningPath(
            id=str(uuid.uuid4()),
            learner_id=profile.id,
            resources=path_resources,
            current_position=0,
            progress={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save learning path
        db.learning_paths.insert_one(asdict(learning_path))
        print(f"✅ Created learning path: {learning_path.id} with {len(path_resources)} resources")
        
        return {
            'profile_id': profile.id,
            'path_id': learning_path.id,
            'initial_resources': path_resources[:3]
        }

orchestrator = AgentOrchestrator()

# Test Gemini connection on startup
def test_gemini_connection():
    try:
        if not GEMINI_API_KEY:
            print("❌ Gemini API key not configured")
            return False
            
        gemini = GeminiClient()
        response = gemini.generate("Test prompt: Say hello", max_tokens=10)
        print(f"✅ Gemini AI connection successful")
        return True
    except Exception as e:
        print(f"❌ Gemini AI connection failed: {e}")
        print("Make sure your GEMINI_API_KEY is correctly set in .env file")
        return False

# Flask routes
@app.route('/api/health', methods=['GET'])
def health_check():
    gemini_status = test_gemini_connection()
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.utcnow().isoformat(),
        'gemini_connected': gemini_status,
        'ai_model': 'gemini-2.0-flash-exp'
    })

@app.route('/api/learner/create', methods=['POST'])
def create_learner():
    try:
        data = request.get_json()
        print(f"🏗️ Creating learner with data: {data}")
        result = orchestrator.process_new_learner(data)
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        print(f"❌ Error creating learner: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/learner/<learner_id>/pretest', methods=['POST'])
def conduct_pretest(learner_id):
    try:
        data = request.get_json()
        subject = data.get('subject', 'algebra')
        
        print(f"📝 Conducting pretest for learner {learner_id}, subject: {subject}")
        
        questions = orchestrator.content_agent.generate_quiz_questions(subject, 2, 5)
        
        pretest = {
            'id': str(uuid.uuid4()),
            'learner_id': learner_id,
            'subject': subject,
            'questions': [asdict(q) for q in questions],
            'created_at': datetime.utcnow()
        }
        
        db.pretests.insert_one(pretest)
        print(f"✅ Created pretest {pretest['id']} with {len(questions)} questions")
        
        return jsonify({
            'success': True,
            'pretest_id': pretest['id'],
            'questions': [{'id': q.id, 'question': q.question, 'options': q.options} for q in questions]
       })
    except Exception as e:
       print(f"❌ Error conducting pretest: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pretest/<pretest_id>/submit', methods=['POST'])
def submit_pretest(pretest_id):
   try:
       data = request.get_json()
       user_answers = data.get('answers', {})
       
       print(f"📝 Submitting pretest {pretest_id} with answers: {user_answers}")
       
       pretest = db.pretests.find_one({'id': pretest_id}, {'_id': 0})
       if not pretest:
           return jsonify({'success': False, 'error': 'Pretest not found'}), 404
       
       questions = [QuizQuestion(**q) for q in pretest['questions']]
       results = []
       
       for question in questions:
           user_answer = user_answers.get(question.id, '')
           evaluation = orchestrator.evaluator_agent.evaluate_quiz_response(question, user_answer)
           results.append(evaluation)
       
       weak_areas = orchestrator.content_agent.analyze_weak_areas(results)
       overall_feedback = orchestrator.evaluator_agent.generate_overall_feedback(results)
       
       print(f"📊 Pretest results: {overall_feedback}")
       print(f"🎯 Identified weak areas: {weak_areas}")
       
       # Update learner profile with weak areas and knowledge level
       update_data = {
           'weak_areas': weak_areas,
           'knowledge_level': max(1, min(5, int(overall_feedback['average_score'] / 20)))
       }
       
       db.learner_profiles.update_one(
           {'id': pretest['learner_id']},
           {'$set': update_data}
       )
       
       # Regenerate learning path with updated profile
       updated_profile = db.learner_profiles.find_one({'id': pretest['learner_id']}, {'_id': 0})
       if updated_profile:
           profile_obj = LearnerProfile(**updated_profile)
           resources = list(db.learning_resources.find({}, {'_id': 0}))
           resource_objects = [LearningResource(**r) for r in resources]
           
           new_path_resources = orchestrator.path_agent.generate_learning_path(profile_obj, resource_objects)
           
           # Update learning path
           db.learning_paths.update_one(
               {'learner_id': pretest['learner_id']},
               {'$set': {
                   'resources': new_path_resources,
                   'current_position': 0,
                   'updated_at': datetime.utcnow()
               }}
           )
           
           print(f"🛤️ Updated learning path with {len(new_path_resources)} resources")
       
       return jsonify({
           'success': True,
           'results': results,
           'overall_feedback': overall_feedback,
           'weak_areas': weak_areas
       })
   except Exception as e:
       print(f"❌ Error submitting pretest: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/learner/<learner_id>/path', methods=['GET'])
def get_learning_path(learner_id):
   try:
       print(f"🛤️ Getting learning path for learner {learner_id}")
       
       path = db.learning_paths.find_one({'learner_id': learner_id}, {'_id': 0})
       if not path:
           print(f"❌ No learning path found for learner {learner_id}")
           return jsonify({'success': False, 'error': 'Learning path not found'}), 404
       
       print(f"📋 Found path: {path}")
       
       current_resource_id = None
       current_resource = None
       
       if path['current_position'] < len(path['resources']):
           current_resource_id = path['resources'][path['current_position']]
           current_resource = db.learning_resources.find_one({'id': current_resource_id}, {'_id': 0})
           print(f"📚 Current resource: {current_resource}")
       
       return jsonify({
           'success': True,
           'data': {
               'path_id': path['id'],
               'current_position': path['current_position'],
               'total_resources': len(path['resources']),
               'current_resource': current_resource,
               'progress': path.get('progress', {}),
               'all_resources': path['resources']
           }
       })
   except Exception as e:
       print(f"❌ Error getting learning path: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/resource/<resource_id>/quiz', methods=['GET'])
def get_resource_quiz(resource_id):
   try:
       print(f"📝 Getting quiz for resource {resource_id}")
       
       resource = db.learning_resources.find_one({'id': resource_id}, {'_id': 0})
       if not resource:
           return jsonify({'success': False, 'error': 'Resource not found'}), 404
       
       questions = orchestrator.content_agent.generate_quiz_questions(resource['topic'], resource['difficulty_level'], 3)
       
       quiz = {
           'id': str(uuid.uuid4()),
           'resource_id': resource_id,
           'questions': [asdict(q) for q in questions],
           'created_at': datetime.utcnow()
       }
       
       db.quizzes.insert_one(quiz)
       
       return jsonify({
           'success': True,
           'data': {
               'quiz_id': quiz['id'],
               'questions': [{'id': q.id, 'question': q.question, 'options': q.options} for q in questions]
           }
       })
   except Exception as e:
       print(f"❌ Error getting resource quiz: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quiz/<quiz_id>/submit', methods=['POST'])
def submit_quiz(quiz_id):
   try:
       data = request.get_json()
       user_answers = data.get('answers', {})
       learner_id = data.get('learner_id')
       
       print(f"📝 Submitting quiz {quiz_id} for learner {learner_id}")
       
       quiz = db.quizzes.find_one({'id': quiz_id}, {'_id': 0})
       if not quiz:
           return jsonify({'success': False, 'error': 'Quiz not found'}), 404
       
       questions = [QuizQuestion(**q) for q in quiz['questions']]
       results = []
       
       for question in questions:
           user_answer = user_answers.get(question.id, '')
           evaluation = orchestrator.evaluator_agent.evaluate_quiz_response(question, user_answer)
           results.append(evaluation)
       
       overall_feedback = orchestrator.evaluator_agent.generate_overall_feedback(results)
       
       # Update learning path progress
       path = db.learning_paths.find_one({'learner_id': learner_id}, {'_id': 0})
       if path:
           if overall_feedback['average_score'] >= 70:
               new_position = min(path['current_position'] + 1, len(path['resources']) - 1)
           else:
               new_position = path['current_position']  # Stay at current position if failed
           
           db.learning_paths.update_one(
               {'learner_id': learner_id},
               {'$set': {
                   'current_position': new_position,
                   f'progress.{quiz["resource_id"]}': overall_feedback,
                   'updated_at': datetime.utcnow()
               }}
           )
           
           print(f"📈 Updated learning path position to {new_position}")
       
       return jsonify({
           'success': True,
           'data': {
               'results': results,
               'overall_feedback': overall_feedback,
               'path_updated': True
           }
       })
   except Exception as e:
       print(f"❌ Error submitting quiz: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/learner/<learner_id>/progress', methods=['GET'])
def get_learner_progress(learner_id):
   try:
       profile = db.learner_profiles.find_one({'id': learner_id}, {'_id': 0})
       path = db.learning_paths.find_one({'learner_id': learner_id}, {'_id': 0})
       
       if not profile or not path:
           return jsonify({'success': False, 'error': 'Learner data not found'}), 404
       
       completed_resources = len([k for k, v in path.get('progress', {}).items() if v.get('average_score', 0) >= 70])
       total_resources = len(path['resources'])
       completion_percentage = (completed_resources / total_resources * 100) if total_resources > 0 else 0
       
       return jsonify({
           'success': True,
           'data': {
               'learner_profile': profile,
               'learning_path': {
                   'id': path['id'],
                   'current_position': path['current_position'],
                   'total_resources': total_resources,
                   'completed_resources': completed_resources,
                   'completion_percentage': completion_percentage
               },
               'progress_details': path.get('progress', {})
           }
       })
   except Exception as e:
       print(f"❌ Error getting learner progress: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/learners', methods=['GET'])
def get_all_learners():
   try:
       learners = list(db.learner_profiles.find({}, {'_id': 0}))
       
       # Sort by creation date (newest first)
       learners.sort(key=lambda x: x.get('created_at', ''), reverse=True)
       
       print(f"📋 Retrieved {len(learners)} learners for admin")
       
       return jsonify({
           'success': True,
           'learners': learners,
           'total': len(learners)
       })
   except Exception as e:
       print(f"❌ Error getting learners: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analytics/dashboard', methods=['GET'])
def get_analytics_dashboard():
   try:
       total_learners = db.learner_profiles.count_documents({})
       total_paths = db.learning_paths.count_documents({})
       total_quizzes = db.quizzes.count_documents({})
       
       learning_styles = list(db.learner_profiles.aggregate([
           {'$group': {'_id': '$learning_style', 'count': {'$sum': 1}}}
       ]))
       
       avg_completion = list(db.learning_paths.aggregate([
           {'$project': {
               'completion_rate': {
                   '$cond': {
                       'if': {'$eq': [{'$size': '$resources'}, 0]},
                       'then': 0,
                       'else': {
                           '$multiply': [
                               {'$divide': ['$current_position', {'$size': '$resources'}]},
                               100
                           ]
                       }
                   }
               }
           }},
           {'$group': {'_id': None, 'avg_completion': {'$avg': '$completion_rate'}}}
       ]))
       
       return jsonify({
           'success': True,
           'analytics': {
               'total_learners': total_learners,
               'total_paths': total_paths,
               'total_quizzes': total_quizzes,
               'learning_styles_distribution': learning_styles,
               'average_completion_rate': avg_completion[0]['avg_completion'] if avg_completion else 0
           }
       })
   except Exception as e:
       print(f"❌ Error getting analytics: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

# AI Test endpoint
@app.route('/api/ai/test', methods=['POST'])
def test_ai():
   try:
       data = request.get_json()
       prompt = data.get('prompt', 'Hello, how are you?')
       
       gemini = GeminiClient()
       response = gemini.generate(prompt, max_tokens=500)
       
       return jsonify({
           'success': True,
           'prompt': prompt,
           'response': response,
           'model': 'gemini-2.0-flash-exp'
       })
   except Exception as e:
       print(f"❌ Error testing AI: {e}")
       return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
   print("🤖 Starting Personalized Tutor API with Gemini AI")
   
   # Test Gemini connection
   if test_gemini_connection():
       print("✅ Ready to serve requests!")
   else:
       print("⚠️ Gemini AI connection issues detected, but server will start anyway")
       print("Make sure to set GEMINI_API_KEY in your .env file")
   
   app.run(debug=True, host='0.0.0.0', port=5000)