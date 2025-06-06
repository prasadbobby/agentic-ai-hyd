import os
import sys
from pymongo import MongoClient
from datetime import datetime

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client.personalized_tutor

def load_sample_resources():
    """Load sample learning resources into the database"""
    
    sample_resources = [
        # Algebra Resources
        {
            'id': 'alg_001',
            'title': 'Introduction to Variables',
            'type': 'video',
            'content_url': 'https://example.com/video1',
            'difficulty_level': 1,
            'learning_style': 'visual',
            'topic': 'variables',
            'prerequisites': []
        },
        {
            'id': 'alg_002',
            'title': 'Solving Linear Equations',
            'type': 'interactive',
            'content_url': 'https://example.com/interactive1',
            'difficulty_level': 2,
            'learning_style': 'kinesthetic',
            'topic': 'linear equations',
            'prerequisites': ['variables']
        },
        {
            'id': 'alg_003',
            'title': 'Combining Like Terms',
            'type': 'text',
            'content_url': 'https://example.com/article1',
            'difficulty_level': 2,
            'learning_style': 'reading',
            'topic': 'like terms',
            'prerequisites': ['variables']
        },
        {
            'id': 'alg_004',
            'title': 'Order of Operations - Visual Guide',
            'type': 'video',
            'content_url': 'https://example.com/video2',
            'difficulty_level': 1,
            'learning_style': 'visual',
            'topic': 'order of operations',
            'prerequisites': []
        },
        {
            'id': 'alg_005',
            'title': 'Graphing Linear Equations',
            'type': 'interactive',
            'content_url': 'https://example.com/interactive2',
            'difficulty_level': 3,
            'learning_style': 'visual',
            'topic': 'graphing',
            'prerequisites': ['linear equations', 'variables']
        },
        {
            'id': 'alg_006',
            'title': 'Variables Audio Lecture',
            'type': 'audio',
            'content_url': 'https://example.com/audio1',
            'difficulty_level': 1,
            'learning_style': 'auditory',
            'topic': 'variables',
            'prerequisites': []
        },
        {
            'id': 'alg_007',
            'title': 'Linear Equations Practice Problems',
            'type': 'practice',
            'content_url': 'https://example.com/practice1',
            'difficulty_level': 2,
            'learning_style': 'kinesthetic',
            'topic': 'linear equations',
            'prerequisites': ['variables']
        },
        {
            'id': 'alg_008',
            'title': 'Universal Math Concepts',
            'type': 'mixed',
            'content_url': 'https://example.com/mixed1',
            'difficulty_level': 1,
            'learning_style': 'universal',
            'topic': 'basic math',
            'prerequisites': []
        },
        {
            'id': 'alg_009',
            'title': 'Order of Operations Practice',
            'type': 'practice',
            'content_url': 'https://example.com/practice2',
            'difficulty_level': 1,
            'learning_style': 'kinesthetic',
            'topic': 'order of operations',
            'prerequisites': []
        },
        {
            'id': 'alg_010',
            'title': 'Algebra Fundamentals Reading',
            'type': 'article',
            'content_url': 'https://example.com/article2',
            'difficulty_level': 1,
            'learning_style': 'reading',
            'topic': 'basic math',
            'prerequisites': []
        },
        
        # Calculus Resources
        {
            'id': 'calc_001',
            'title': 'Introduction to Limits',
            'type': 'video',
            'content_url': 'https://example.com/calc_video1',
            'difficulty_level': 2,
            'learning_style': 'visual',
            'topic': 'limits',
            'prerequisites': []
        },
        {
            'id': 'calc_002',
            'title': 'Understanding Derivatives',
            'type': 'interactive',
            'content_url': 'https://example.com/calc_interactive1',
            'difficulty_level': 3,
            'learning_style': 'kinesthetic',
            'topic': 'derivatives',
            'prerequisites': ['limits']
        },
        {
            'id': 'calc_003',
            'title': 'Limits Reading Guide',
            'type': 'article',
            'content_url': 'https://example.com/calc_article1',
            'difficulty_level': 2,
            'learning_style': 'reading',
            'topic': 'limits',
            'prerequisites': []
        },
        {
            'id': 'calc_004',
            'title': 'Integration Basics',
            'type': 'video',
            'content_url': 'https://example.com/calc_video2',
            'difficulty_level': 4,
            'learning_style': 'visual',
            'topic': 'integrals',
            'prerequisites': ['derivatives', 'limits']
        },
        {
            'id': 'calc_005',
            'title': 'Continuity Concepts',
            'type': 'audio',
            'content_url': 'https://example.com/calc_audio1',
            'difficulty_level': 3,
            'learning_style': 'auditory',
            'topic': 'continuity',
            'prerequisites': ['limits']
        },
        {
            'id': 'calc_006',
            'title': 'Advanced Calculus Reading',
            'type': 'article',
            'content_url': 'https://example.com/calc_article2',
            'difficulty_level': 5,
            'learning_style': 'reading',
            'topic': 'advanced calculus',
            'prerequisites': ['derivatives', 'integrals']
        },
        {
            'id': 'calc_007',
            'title': 'Limits Practice Exercises',
            'type': 'practice',
            'content_url': 'https://example.com/calc_practice1',
            'difficulty_level': 2,
            'learning_style': 'kinesthetic',
            'topic': 'limits',
            'prerequisites': []
        },
        {
            'id': 'calc_008',
            'title': 'Derivative Rules Visual Guide',
            'type': 'video',
            'content_url': 'https://example.com/calc_video3',
            'difficulty_level': 3,
            'learning_style': 'visual',
            'topic': 'derivatives',
            'prerequisites': ['limits']
        },
        
        # Geometry Resources
        {
            'id': 'geom_001',
            'title': 'Basic Shapes and Angles',
            'type': 'video',
            'content_url': 'https://example.com/geom_video1',
            'difficulty_level': 1,
            'learning_style': 'visual',
            'topic': 'angles',
            'prerequisites': []
        },
        {
            'id': 'geom_002',
            'title': 'Triangle Properties',
            'type': 'interactive',
            'content_url': 'https://example.com/geom_interactive1',
            'difficulty_level': 2,
            'learning_style': 'kinesthetic',
            'topic': 'triangles',
            'prerequisites': ['angles']
        },
        {
            'id': 'geom_003',
            'title': 'Circle Geometry Guide',
            'type': 'article',
            'content_url': 'https://example.com/geom_article1',
            'difficulty_level': 3,
            'learning_style': 'reading',
            'topic': 'circles',
            'prerequisites': ['angles']
        },
        {
            'id': 'geom_004',
            'title': 'Area and Perimeter Calculations',
            'type': 'practice',
            'content_url': 'https://example.com/geom_practice1',
            'difficulty_level': 2,
            'learning_style': 'kinesthetic',
            'topic': 'area',
            'prerequisites': ['triangles']
        },
        {
            'id': 'geom_005',
            'title': 'Volume and Surface Area',
            'type': 'video',
            'content_url': 'https://example.com/geom_video2',
            'difficulty_level': 3,
            'learning_style': 'visual',
            'topic': 'volume',
            'prerequisites': ['area']
        },
        {
            'id': 'geom_006',
            'title': 'Coordinate Geometry',
            'type': 'interactive',
            'content_url': 'https://example.com/geom_interactive2',
            'difficulty_level': 4,
            'learning_style': 'kinesthetic',
            'topic': 'coordinate geometry',
            'prerequisites': ['triangles', 'area']
        },
        
        # Trigonometry Resources
        {
            'id': 'trig_001',
            'title': 'Introduction to Trigonometry',
            'type': 'video',
            'content_url': 'https://example.com/trig_video1',
            'difficulty_level': 2,
            'learning_style': 'visual',
            'topic': 'sine',
            'prerequisites': ['triangles']
        },
        {
            'id': 'trig_002',
            'title': 'Sine, Cosine, and Tangent',
            'type': 'interactive',
            'content_url': 'https://example.com/trig_interactive1',
            'difficulty_level': 3,
            'learning_style': 'kinesthetic',
            'topic': 'cosine',
            'prerequisites': ['sine']
        },
        {
            'id': 'trig_003',
            'title': 'Trigonometric Identities',
            'type': 'article',
            'content_url': 'https://example.com/trig_article1',
            'difficulty_level': 4,
            'learning_style': 'reading',
            'topic': 'identities',
            'prerequisites': ['sine', 'cosine']
        },
        {
            'id': 'trig_004',
            'title': 'Graphing Trigonometric Functions',
            'type': 'video',
            'content_url': 'https://example.com/trig_video2',
            'difficulty_level': 4,
            'learning_style': 'visual',
            'topic': 'graphs',
            'prerequisites': ['sine', 'cosine']
        },
        {
            'id': 'trig_005',
            'title': 'Unit Circle Exploration',
            'type': 'interactive',
            'content_url': 'https://example.com/trig_interactive2',
            'difficulty_level': 3,
            'learning_style': 'kinesthetic',
            'topic': 'unit circle',
            'prerequisites': ['sine', 'cosine']
        },
        {
            'id': 'trig_006',
            'title': 'Trigonometry Applications',
            'type': 'practice',
            'content_url': 'https://example.com/trig_practice1',
            'difficulty_level': 4,
            'learning_style': 'kinesthetic',
            'topic': 'applications',
            'prerequisites': ['identities', 'graphs']
        },
        
        # Universal/Mixed Resources
        {
            'id': 'univ_001',
            'title': 'Mathematical Problem Solving Strategies',
            'type': 'article',
            'content_url': 'https://example.com/univ_article1',
            'difficulty_level': 2,
            'learning_style': 'universal',
            'topic': 'problem solving',
            'prerequisites': []
        },
        {
            'id': 'univ_002',
            'title': 'Math Anxiety and Confidence Building',
            'type': 'audio',
            'content_url': 'https://example.com/univ_audio1',
            'difficulty_level': 1,
            'learning_style': 'universal',
            'topic': 'confidence',
            'prerequisites': []
        },
        {
            'id': 'univ_003',
            'title': 'Study Techniques for Mathematics',
            'type': 'video',
            'content_url': 'https://example.com/univ_video1',
            'difficulty_level': 1,
            'learning_style': 'universal',
            'topic': 'study techniques',
            'prerequisites': []
        },
        {
            'id': 'univ_004',
            'title': 'Mathematical Reasoning and Logic',
            'type': 'interactive',
            'content_url': 'https://example.com/univ_interactive1',
            'difficulty_level': 3,
            'learning_style': 'universal',
            'topic': 'reasoning',
            'prerequisites': []
        },
        
        # Advanced Resources for High-Level Learners
        {
            'id': 'adv_001',
            'title': 'Advanced Mathematical Proofs',
            'type': 'article',
            'content_url': 'https://example.com/adv_article1',
            'difficulty_level': 5,
            'learning_style': 'reading',
            'topic': 'proofs',
            'prerequisites': ['reasoning']
        },
        {
            'id': 'adv_002',
            'title': 'Real-World Applications of Calculus',
            'type': 'video',
            'content_url': 'https://example.com/adv_video1',
            'difficulty_level': 5,
            'learning_style': 'visual',
            'topic': 'applications',
            'prerequisites': ['derivatives', 'integrals']
        },
        {
            'id': 'adv_003',
            'title': 'Complex Mathematical Modeling',
            'type': 'practice',
            'content_url': 'https://example.com/adv_practice1',
            'difficulty_level': 5,
            'learning_style': 'kinesthetic',
            'topic': 'modeling',
            'prerequisites': ['advanced calculus', 'applications']
        }
    ]
    
    try:
        # Clear existing resources
        result = db.learning_resources.delete_many({})
        print(f"🗑️  Cleared {result.deleted_count} existing resources")
        
        # Insert new resources
        result = db.learning_resources.insert_many(sample_resources)
        print(f"✅ Successfully loaded {len(result.inserted_ids)} learning resources")
        
        # Create indexes for better performance
        db.learning_resources.create_index("id", unique=True)
        db.learning_resources.create_index("topic")
        db.learning_resources.create_index("learning_style")
        db.learning_resources.create_index("difficulty_level")
        print("📊 Created database indexes")
        
        # Log resource breakdown by subject
        subjects = {}
        for resource in sample_resources:
            subject = resource['id'].split('_')[0]
            subjects[subject] = subjects.get(subject, 0) + 1
        
        print(f"📚 Resource breakdown: {subjects}")
        print(f"🎉 Total resources loaded: {len(sample_resources)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading resources: {e}")
        return False

def main():
    print("🚀 Starting data loading process...")
    print(f"📡 Connecting to MongoDB...")
    
    try:
        # Test connection
        db.command('ping')
        print("✅ Connected to MongoDB successfully")
        
        # Load resources
        if load_sample_resources():
            print("🎉 Data loading completed successfully!")
            print("\n📋 Summary:")
            print(f"   - Learning resources: {db.learning_resources.count_documents({})}")
            print(f"   - Database: {db.name}")
        else:
            print("❌ Data loading failed!")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("💡 Make sure MongoDB is running and connection string is correct")
        sys.exit(1)

if __name__ == "__main__":
    main()