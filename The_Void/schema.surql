-- 1. DEFINE NAMESPACE AND DATABASE
DEFINE NAMESPACE neurograph;
DEFINE DATABASE zettelkasten;

-- 2. DEFINE NODE TABLES (Vertices)
DEFINE TABLE topic SCHEMAFULL;
DEFINE FIELD title ON topic TYPE string;
DEFINE FIELD tags ON topic TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON topic TYPE datetime DEFAULT time::now();
DEFINE FIELD status ON topic TYPE string DEFAULT 'active';

DEFINE TABLE task SCHEMAFULL;
DEFINE FIELD title ON task TYPE string;
DEFINE FIELD status ON task TYPE string DEFAULT 'pending';
DEFINE FIELD tags ON task TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON task TYPE datetime DEFAULT time::now();
DEFINE FIELD due_date ON task TYPE option<datetime>;

DEFINE TABLE document SCHEMAFULL;
DEFINE FIELD title ON document TYPE string;
DEFINE FIELD content ON document TYPE string;
DEFINE FIELD tags ON document TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON document TYPE datetime DEFAULT time::now();
DEFINE FIELD word_count ON document TYPE number DEFAULT 0;

-- 3. DEFINE EDGE TABLES (Relations)
DEFINE TABLE relates_to SCHEMAFULL TYPE RELATION FROM any TO any;
DEFINE FIELD created_at ON relates_to TYPE datetime DEFAULT time::now();
DEFINE FIELD weight ON relates_to TYPE number DEFAULT 1.0;

DEFINE TABLE references SCHEMAFULL TYPE RELATION FROM document TO any;
DEFINE FIELD created_at ON references TYPE datetime DEFAULT time::now();

DEFINE TABLE event SCHEMAFULL;
DEFINE FIELD title ON event TYPE string;
DEFINE FIELD tags ON event TYPE array<string> DEFAULT [];
DEFINE FIELD status ON event TYPE string DEFAULT 'pending';
DEFINE FIELD event_date ON event TYPE option<datetime>;
DEFINE FIELD missing_time ON event TYPE bool DEFAULT false;
DEFINE FIELD created_at ON event TYPE datetime DEFAULT time::now();

DEFINE TABLE list SCHEMAFULL;
DEFINE FIELD title ON list TYPE string;
DEFINE FIELD items ON list TYPE array<string> DEFAULT [];
DEFINE FIELD tags ON list TYPE array<string> DEFAULT [];
DEFINE FIELD created_at ON list TYPE datetime DEFAULT time::now();

DEFINE FIELD items ON event TYPE array<string> DEFAULT [];