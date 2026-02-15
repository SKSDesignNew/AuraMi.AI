-- ============================================================
-- MyVansh.AI — Sample Seed Data
-- Run this in Supabase SQL Editor to populate test data
-- ============================================================

-- 1. Countries (common ones)
INSERT INTO countries (id, name, code) VALUES
  (gen_random_uuid(), 'India', 'IN'),
  (gen_random_uuid(), 'United States', 'US'),
  (gen_random_uuid(), 'United Kingdom', 'UK'),
  (gen_random_uuid(), 'Canada', 'CA'),
  (gen_random_uuid(), 'Australia', 'AU'),
  (gen_random_uuid(), 'Pakistan', 'PK'),
  (gen_random_uuid(), 'Bangladesh', 'BD'),
  (gen_random_uuid(), 'Nepal', 'NP'),
  (gen_random_uuid(), 'Sri Lanka', 'LK'),
  (gen_random_uuid(), 'Kenya', 'KE'),
  (gen_random_uuid(), 'South Africa', 'ZA'),
  (gen_random_uuid(), 'Germany', 'DE'),
  (gen_random_uuid(), 'France', 'FR'),
  (gen_random_uuid(), 'Japan', 'JP'),
  (gen_random_uuid(), 'China', 'CN')
ON CONFLICT DO NOTHING;

-- 2. Get India's country ID for references
-- (We'll use a variable approach with DO block)

DO $$
DECLARE
  v_india_id uuid;
  v_household_id uuid;
  v_user_id uuid := '00000000-0000-0000-0000-000000000001'; -- placeholder demo user

  -- Person IDs
  v_ramesh_id uuid;
  v_savitri_id uuid;
  v_suresh_id uuid;
  v_meena_id uuid;
  v_anil_id uuid;
  v_priya_id uuid;
  v_vikram_id uuid;
  v_anjali_id uuid;
  v_rajesh_id uuid;
  v_sunita_id uuid;
  v_deepak_id uuid;
  v_neha_id uuid;
  v_arjun_id uuid;
  v_kavita_id uuid;
  v_rohan_id uuid;

  -- Event IDs
  v_event_wedding1 uuid;
  v_event_wedding2 uuid;
  v_event_migration uuid;
  v_event_independence uuid;

BEGIN
  -- Get India country ID
  SELECT id INTO v_india_id FROM countries WHERE code = 'IN' LIMIT 1;

  -- 3. Create demo household
  v_household_id := gen_random_uuid();
  INSERT INTO households (id, name, created_by, created_at)
  VALUES (v_household_id, 'The Kumar Family', v_user_id, now());

  -- 4. Add persons (3 generations of a family)

  -- Generation 1 (Great-grandparents)
  v_ramesh_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, death_date, notes, created_by)
  VALUES (v_ramesh_id, v_household_id, 'Ramesh', 'Kumar', 'Bauji', 'male', 1920, 3, 15, 'Allahabad', 'Allahabad, Uttar Pradesh', v_india_id, '1995-08-12', 'Ramesh Kumar was a school teacher in Allahabad. Known for his strict discipline and love for Hindi literature. He walked 10 miles to school every day during monsoon season. He was deeply respected in the community and served as the village education committee head for 20 years.', v_user_id);

  v_savitri_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, death_date, notes, created_by)
  VALUES (v_savitri_id, v_household_id, 'Savitri', 'Devi', 'Dadi', 'female', 1925, 8, 22, 'Varanasi', 'Varanasi, Uttar Pradesh', v_india_id, '2005-01-03', 'Savitri Devi was a homemaker who raised 4 children. She was known for her incredible cooking, especially her mango pickle recipe that the whole neighborhood would come for. She was also a talented singer of bhajans.', v_user_id);

  -- Generation 2 (Grandparents / Parents)
  v_suresh_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_suresh_id, v_household_id, 'Suresh', 'Kumar', 'Papa', 'male', 1950, 11, 8, 'Allahabad', 'Allahabad, Uttar Pradesh', v_india_id, 'Suresh Kumar is a retired government officer. Worked in the Indian Railways for 35 years. He was the first in the family to get a college degree. Moved to Delhi in 1975 for his posting.', v_user_id);

  v_meena_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_meena_id, v_household_id, 'Meena', 'Kumar', 'Mummy', 'female', 1955, 4, 12, 'Lucknow', 'Lucknow, Uttar Pradesh', v_india_id, 'Meena Kumar (née Sharma) is a retired school principal. She taught English literature for 30 years. Known for encouraging girls'' education in the community.', v_user_id);

  v_anil_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_anil_id, v_household_id, 'Anil', 'Kumar', 'Chacha', 'male', 1953, 7, 20, 'Allahabad', 'Allahabad, Uttar Pradesh', v_india_id, 'Anil Kumar is a doctor. He runs a clinic in Allahabad and is known for treating patients from poor families for free.', v_user_id);

  v_priya_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_priya_id, v_household_id, 'Priya', 'Kumar', 'Chachi', 'female', 1957, 9, 5, 'Kanpur', 'Kanpur, Uttar Pradesh', v_india_id, 'Priya Kumar (née Gupta) is a homemaker and talented artist. She paints landscapes and has exhibited her work at local galleries.', v_user_id);

  -- Generation 3 (Current generation)
  v_vikram_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_vikram_id, v_household_id, 'Vikram', 'Kumar', 'Vicky', 'male', 1980, 2, 14, 'Delhi', 'New Delhi', v_india_id, 'Vikram Kumar is a software engineer working in Bangalore. He moved to the US for his masters and returned to India in 2010. He is passionate about preserving family history.', v_user_id);

  v_anjali_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_anjali_id, v_household_id, 'Anjali', 'Kumar', NULL, 'female', 1982, 6, 30, 'Delhi', 'New Delhi', v_india_id, 'Anjali Kumar is a journalist based in Mumbai. She writes about culture and heritage.', v_user_id);

  v_rajesh_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_rajesh_id, v_household_id, 'Rajesh', 'Kumar', 'Raju', 'male', 1983, 12, 1, 'Allahabad', 'Allahabad, Uttar Pradesh', v_india_id, 'Rajesh Kumar is a chartered accountant. He manages the family finances and lives in Pune.', v_user_id);

  v_sunita_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_sunita_id, v_household_id, 'Sunita', 'Kumar', NULL, 'female', 1985, 5, 18, 'Allahabad', 'Allahabad, Uttar Pradesh', v_india_id, 'Sunita Kumar is a teacher following in the footsteps of her grandfather Ramesh. She teaches in a government school in Lucknow.', v_user_id);

  -- Generation 4 (Youngest)
  v_deepak_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_deepak_id, v_household_id, 'Deepak', 'Kumar', NULL, 'male', 2005, 1, 10, 'Bangalore', 'Bangalore, Karnataka', v_india_id, 'Deepak Kumar is a college student studying computer science.', v_user_id);

  v_neha_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_neha_id, v_household_id, 'Neha', 'Kumar', NULL, 'female', 2008, 10, 25, 'Bangalore', 'Bangalore, Karnataka', v_india_id, 'Neha Kumar is a high school student who loves dance and music.', v_user_id);

  v_arjun_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_arjun_id, v_household_id, 'Arjun', 'Kumar', NULL, 'male', 2007, 3, 8, 'Pune', 'Pune, Maharashtra', v_india_id, 'Arjun Kumar is a teenager interested in cricket and robotics.', v_user_id);

  v_kavita_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_kavita_id, v_household_id, 'Kavita', 'Mehta', NULL, 'female', 1982, 8, 15, 'Jaipur', 'Jaipur, Rajasthan', v_india_id, 'Kavita Mehta (née Kumar) married and moved to Jaipur. She is a pediatrician.', v_user_id);

  v_rohan_id := gen_random_uuid();
  INSERT INTO persons (id, household_id, first_name, last_name, nickname, sex, birth_year, birth_month, birth_day, birth_city, birth_place, birth_country_id, notes, created_by)
  VALUES (v_rohan_id, v_household_id, 'Rohan', 'Mehta', NULL, 'male', 2010, 11, 20, 'Jaipur', 'Jaipur, Rajasthan', v_india_id, 'Rohan Mehta is a school student in Jaipur.', v_user_id);

  -- 5. Relationships

  -- Ramesh & Savitri are spouses
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, start_date, source)
  VALUES (v_household_id, v_ramesh_id, v_savitri_id, 'spouse', NULL, '1945-05-10', 'manual');

  -- Ramesh & Savitri are parents of Suresh and Anil
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES
    (v_household_id, v_ramesh_id, v_suresh_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_savitri_id, v_suresh_id, 'parent', 'Mother', 'manual'),
    (v_household_id, v_ramesh_id, v_anil_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_savitri_id, v_anil_id, 'parent', 'Mother', 'manual');

  -- Suresh & Anil are siblings
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES (v_household_id, v_suresh_id, v_anil_id, 'sibling', 'Brother', 'manual');

  -- Suresh & Meena are spouses
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, start_date, source)
  VALUES (v_household_id, v_suresh_id, v_meena_id, 'spouse', NULL, '1978-02-20', 'manual');

  -- Anil & Priya are spouses
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, start_date, source)
  VALUES (v_household_id, v_anil_id, v_priya_id, 'spouse', NULL, '1980-11-15', 'manual');

  -- Suresh & Meena are parents of Vikram, Anjali, Kavita
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES
    (v_household_id, v_suresh_id, v_vikram_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_meena_id, v_vikram_id, 'parent', 'Mother', 'manual'),
    (v_household_id, v_suresh_id, v_anjali_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_meena_id, v_anjali_id, 'parent', 'Mother', 'manual'),
    (v_household_id, v_suresh_id, v_kavita_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_meena_id, v_kavita_id, 'parent', 'Mother', 'manual');

  -- Anil & Priya are parents of Rajesh, Sunita
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES
    (v_household_id, v_anil_id, v_rajesh_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_priya_id, v_rajesh_id, 'parent', 'Mother', 'manual'),
    (v_household_id, v_anil_id, v_sunita_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_priya_id, v_sunita_id, 'parent', 'Mother', 'manual');

  -- Vikram is parent of Deepak, Neha
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES
    (v_household_id, v_vikram_id, v_deepak_id, 'parent', 'Father', 'manual'),
    (v_household_id, v_vikram_id, v_neha_id, 'parent', 'Father', 'manual');

  -- Rajesh is parent of Arjun
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES (v_household_id, v_rajesh_id, v_arjun_id, 'parent', 'Father', 'manual');

  -- Kavita is parent of Rohan
  INSERT INTO relationships (household_id, from_person_id, to_person_id, relation_type, relation_label, source)
  VALUES (v_household_id, v_kavita_id, v_rohan_id, 'parent', 'Mother', 'manual');

  -- 6. Events

  v_event_wedding1 := gen_random_uuid();
  INSERT INTO events (id, household_id, title, event_type, event_date, event_year, location, description, created_by)
  VALUES (v_event_wedding1, v_household_id, 'Wedding of Ramesh and Savitri', 'marriage', '1945-05-10', 1945, 'Varanasi, Uttar Pradesh', 'A traditional Hindu wedding ceremony in Varanasi. The whole village attended and celebrations lasted 3 days.', v_user_id);

  INSERT INTO event_links (household_id, event_id, person_id, role) VALUES
    (v_household_id, v_event_wedding1, v_ramesh_id, 'groom'),
    (v_household_id, v_event_wedding1, v_savitri_id, 'bride');

  v_event_wedding2 := gen_random_uuid();
  INSERT INTO events (id, household_id, title, event_type, event_date, event_year, location, description, created_by)
  VALUES (v_event_wedding2, v_household_id, 'Wedding of Suresh and Meena', 'marriage', '1978-02-20', 1978, 'Lucknow, Uttar Pradesh', 'Suresh and Meena''s wedding in Lucknow. Meena''s family hosted a grand reception.', v_user_id);

  INSERT INTO event_links (household_id, event_id, person_id, role) VALUES
    (v_household_id, v_event_wedding2, v_suresh_id, 'groom'),
    (v_household_id, v_event_wedding2, v_meena_id, 'bride');

  v_event_migration := gen_random_uuid();
  INSERT INTO events (id, household_id, title, event_type, event_date, event_year, location, description, created_by)
  VALUES (v_event_migration, v_household_id, 'Suresh moves to Delhi for Railways posting', 'migration', '1975-06-01', 1975, 'Delhi', 'Suresh received his first posting with Indian Railways in Delhi. He moved from Allahabad, leaving behind the family home.', v_user_id);

  INSERT INTO event_links (household_id, event_id, person_id, role) VALUES
    (v_household_id, v_event_migration, v_suresh_id, 'subject');

  v_event_independence := gen_random_uuid();
  INSERT INTO events (id, household_id, title, event_type, event_year, location, description, created_by)
  VALUES (v_event_independence, v_household_id, 'Ramesh witnesses India''s Independence', 'custom', 1947, 'Allahabad, Uttar Pradesh', 'Ramesh was 27 years old when India gained independence. He participated in local celebrations and later told stories about the euphoria in Allahabad.', v_user_id);

  INSERT INTO event_links (household_id, event_id, person_id, role) VALUES
    (v_household_id, v_event_independence, v_ramesh_id, 'witness');

  -- More events
  INSERT INTO events (household_id, title, event_type, event_date, event_year, location, description, created_by)
  VALUES
    (v_household_id, 'Vikram moves to USA for Masters', 'migration', '2004-08-15', 2004, 'San Jose, California, USA', 'Vikram went to the US for his MS in Computer Science at San Jose State University.', v_user_id),
    (v_household_id, 'Vikram returns to India', 'migration', '2010-03-01', 2010, 'Bangalore, Karnataka', 'After 6 years in the US, Vikram returned to India and joined a tech company in Bangalore.', v_user_id),
    (v_household_id, 'Kavita graduates from medical school', 'achievement', '2006-05-20', 2006, 'Delhi', 'Kavita completed her MBBS and pediatrics specialization from AIIMS Delhi.', v_user_id);

  -- 7. Stories

  INSERT INTO stories (household_id, title, content, narrator_id, era, location, tags, created_by)
  VALUES
    (v_household_id,
     'Grandpa''s Monsoon Walk to School',
     'My grandmother used to tell us how grandpa Ramesh would walk 10 miles to school every day, even during the heaviest monsoon rains. The roads would flood and he would carry his books above his head wrapped in a cloth to keep them dry. Once, the river near the school overflowed and he had to wade through waist-deep water. When he finally arrived at school, the teacher was so impressed by his dedication that he gave Ramesh his own dry kurta to wear. This story was always told at family gatherings to remind the younger generation about the value of education and perseverance.',
     v_savitri_id, '1930s', 'Allahabad, Uttar Pradesh',
     ARRAY['education', 'perseverance', 'monsoon', 'childhood'],
     v_user_id),

    (v_household_id,
     'Dadi''s Famous Mango Pickle',
     'Every summer, when the raw mangoes would arrive from the orchards, Dadi Savitri would take over the kitchen for three days straight. She had a secret recipe for mango pickle that had been passed down from her mother. The whole house would smell of mustard oil and spices. Neighbors would line up with their jars, and Dadi would never turn anyone away. She always said "food shared is love multiplied." We tried many times to write down her exact recipe, but she always did everything by feel — "a pinch of this, a handful of that." After she passed, we realized we had lost something irreplaceable.',
     v_meena_id, '1960s-1990s', 'Allahabad, Uttar Pradesh',
     ARRAY['food', 'tradition', 'family recipe', 'summer'],
     v_user_id),

    (v_household_id,
     'The Day We Got Our First Television',
     'In 1982, when the Asian Games came to Delhi, Papa (Suresh) brought home our first television set. It was a black and white Weston TV. The entire neighborhood would crowd into our small living room to watch the games. Chacha Anil would provide running commentary even though there was already a commentator on TV. That television became the center of our social life — every Sunday, families would gather to watch Ramayan and later Mahabharat.',
     v_vikram_id, '1980s', 'Delhi',
     ARRAY['technology', 'community', 'television', 'Asian Games'],
     v_user_id);

  -- Link persons to stories
  INSERT INTO story_persons (story_id, person_id, mention_type)
  SELECT s.id, v_ramesh_id, 'subject'
  FROM stories s WHERE s.title = 'Grandpa''s Monsoon Walk to School' AND s.household_id = v_household_id;

  INSERT INTO story_persons (story_id, person_id, mention_type)
  SELECT s.id, v_savitri_id, 'subject'
  FROM stories s WHERE s.title = 'Dadi''s Famous Mango Pickle' AND s.household_id = v_household_id;

  INSERT INTO story_persons (story_id, person_id, mention_type)
  SELECT s.id, v_suresh_id, 'mentioned'
  FROM stories s WHERE s.title = 'The Day We Got Our First Television' AND s.household_id = v_household_id;

  INSERT INTO story_persons (story_id, person_id, mention_type)
  SELECT s.id, v_anil_id, 'mentioned'
  FROM stories s WHERE s.title = 'The Day We Got Our First Television' AND s.household_id = v_household_id;

  -- Output the household ID for reference
  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Household ID: %', v_household_id;
  RAISE NOTICE 'Use this household ID in your app to test.';

END $$;
