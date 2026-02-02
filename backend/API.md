# Tarbeya Backend API Documentation

- Base URL: `http://localhost:5000/api`
- Content Type: `application/json`
- Authentication: None
- Database: Controlled via `MONGODB_URI`. If no db name provided, MongoDB defaults to `test`.

## Health
- GET `/health`
  - Response: `{ status: "OK", message: "Server is running" }`

## Data Models

### Faculty
- `faculty_name` (string, required, unique)

### ResearchTopic
- `topic_name` (string, required, unique)

### EnrolledStudent
- `national_id` (number, required, unique)
- `sequence_number` (number, required)
- `student_name` (string, required)
- `faculty_name` (string, required)
- `registered_research` (boolean, default: false)
- `finished_research` (boolean, default: false)

### RegisteredStudent
- `national_id` (number, required, unique)
- `sequence_number` (number, required)
- `student_name` (string, required)
- `phone_number` (string, required)
- `faculty_name` (string, required)
- `research_name` (string, required)
- `educational_level` (string, required)
- `team_code` (string, required)
- `registration_date` (date, auto-set)

### Team
- `team_code` (string, required, unique)
- `faculty_name` (string, required)
- `student_names` (string[], default: [])
- `national_ids` (number[], default: [])
- `leader_national_id` (number, auto-set to first of `national_ids`)
- `research_topics` (string[], default: [])

> Team size validation uses the Config collection: `min_team_members` ≤ team size ≤ `max_team_members`. Team size is the max of `student_names.length` and `national_ids.length`.

### Config (Singleton)
- `registration_status` (boolean, default: false)
- `automatic_assignment` (boolean, default: false)
- `max_team_members` (number, default: 5)
- `min_team_members` (number, default: 1)

---

## Faculties

- GET `/faculties`
  - Returns list of faculties
- GET `/faculties/:id`
  - Returns a single faculty by Mongo `_id`
- POST `/faculties`
  - Body: `{ "faculty_name": "Engineering" }`
  - Creates a new faculty
- PUT `/faculties/:id`
  - Body: `{ "faculty_name": "Science" }`
  - Updates an existing faculty
- DELETE `/faculties/:id`
  - Deletes a faculty

Examples:
```bash
curl -X POST http://localhost:5000/api/faculties \
  -H "Content-Type: application/json" \
  -d '{"faculty_name":"Engineering"}'
```

## Research Topics

- GET `/research-topics`
- GET `/research-topics/:id`
- POST `/research-topics`
  - Body: `{ "topic_name": "AI Ethics" }`
- PUT `/research-topics/:id`
- DELETE `/research-topics/:id`

Examples:
```bash
curl -X POST http://localhost:5000/api/research-topics \
  -H "Content-Type: application/json" \
  -d '{"topic_name":"AI Ethics"}'
```

## Enrolled Students

- GET `/enrolled-students`
- GET `/enrolled-students/:id`
- GET `/enrolled-students/national/:nationalId`
- POST `/enrolled-students`
  - Body:
    ```json
    {
      "national_id": 1234567890,
      "sequence_number": 1,
      "student_name": "John Doe",
      "faculty_name": "Engineering",
      "registered_research": false,
      "finished_research": false
    }
    ```
- PUT `/enrolled-students/:id`
- DELETE `/enrolled-students/:id`

Examples:
```bash
curl -X POST http://localhost:5000/api/enrolled-students \
  -H "Content-Type: application/json" \
  -d '{
    "national_id": 1234567890,
    "sequence_number": 1,
    "student_name": "John Doe",
    "faculty_name": "Engineering"
  }'
```

## Registered Students

- GET `/registered-students`
- GET `/registered-students/:id`
- GET `/registered-students/national/:nationalId`
- GET `/registered-students/team/:teamCode`
- POST `/registered-students`
  - Body:
    ```json
    {
      "national_id": 1234567890,
      "sequence_number": 1,
      "student_name": "John Doe",
      "phone_number": "+20123456789",
      "faculty_name": "Engineering",
      "research_name": "AI Ethics",
      "educational_level": "Undergraduate",
      "team_code": "TEAM-001"
    }
    ```
- PUT `/registered-students/:id`
- DELETE `/registered-students/:id`

Examples:
```bash
curl -X POST http://localhost:5000/api/registered-students \
  -H "Content-Type: application/json" \
  -d '{
    "national_id": 1234567890,
    "sequence_number": 1,
    "student_name": "John Doe",
    "phone_number": "+20123456789",
    "faculty_name": "Engineering",
    "research_name": "AI Ethics",
    "educational_level": "Undergraduate",
    "team_code": "TEAM-001"
  }'
```

## Teams

- GET `/teams`
- GET `/teams/:id`
- GET `/teams/code/:teamCode`
- POST `/teams`
  - Body:
    ```json
    {
      "team_code": "TEAM-001",
      "faculty_name": "Engineering",
      "student_names": ["John Doe", "Jane Smith"],
      "national_ids": [1234567890, 9876543210],
      "research_topics": ["AI Ethics", "ML Ops"]
    }
    ```
  - Notes:
    - Team size must satisfy Config limits
    - `leader_national_id` automatically set to the first of `national_ids`
- PUT `/teams/:id`
  - Body: May include any updatable fields, e.g. `student_names`, `national_ids`, `research_topics`, etc.
  - Notes:
    - When `national_ids` are provided, `leader_national_id` is reset to the first item (or cleared if empty)
- DELETE `/teams/:id`

Examples:
```bash
curl -X POST http://localhost:5000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "team_code": "TEAM-001",
    "faculty_name": "Engineering",
    "student_names": ["John Doe", "Jane Smith"],
    "national_ids": [1234567890, 9876543210],
    "research_topics": ["AI Ethics", "ML Ops"]
  }'
```

## Config

- GET `/config`
  - Returns the entire Config document (created automatically on first access)
- GET `/config/registration-status`
- PUT `/config/registration-status`
  - Body: `{ "registration_status": true }`
- GET `/config/automatic-assignment`
- PUT `/config/automatic-assignment`
  - Body: `{ "automatic_assignment": true }`
- GET `/config/team-limits`
- PUT `/config/team-limits`
  - Body (any combination):
    ```json
    {
      "min_team_members": 2,
      "max_team_members": 6
    }
    ```
  - Validation:
    - `min_team_members >= 1`
    - `max_team_members >= 1`
    - `min_team_members <= max_team_members`

Examples:
```bash
curl -X PUT http://localhost:5000/api/config/team-limits \
  -H "Content-Type: application/json" \
  -d '{"min_team_members":2, "max_team_members":6}'
```

## Error Responses
- 400: Validation or bad request (e.g., unique constraint violation, invalid limits)
- 404: Resource not found
- 500: Internal server error

## Notes
- Unique fields: `faculty_name`, `topic_name`, `team_code`, `enrolledStudents.national_id`, `registeredStudents.national_id`
- No references are enforced between collections; controllers perform validations based on config only.
