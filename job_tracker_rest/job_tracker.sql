BEGIN;


CREATE TABLE IF NOT EXISTS public."Users"
(
    user_id serial NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    pass character varying(255) NOT NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT email UNIQUE (email)
        INCLUDE(email)
);

CREATE TABLE IF NOT EXISTS public."Jobs"
(
    job_id serial NOT NULL,
    job_title character varying(255) NOT NULL,
    notes character varying(255),
    date_applied date NOT NULL,
    status character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    user_id serial NOT NULL,
    company_id serial NOT NULL,
    PRIMARY KEY (job_id)
);

CREATE TABLE IF NOT EXISTS public."Skills"
(
    skill_id serial NOT NULL,
    skill_title character varying(255) NOT NULL,
    user_id serial NOT NULL,
    PRIMARY KEY (skill_id),
    CONSTRAINT skill_title UNIQUE (skill_title)
        INCLUDE(skill_title)
);

CREATE TABLE IF NOT EXISTS public."Skills_Jobs"
(
    "Skills_skill_id" serial NOT NULL,
    "Jobs_job_id" serial NOT NULL
);

CREATE TABLE IF NOT EXISTS public."Contacts"
(
    contact_id serial NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    notes character varying(255),
    user_id serial NOT NULL,
    company_id serial NOT NULL,
    PRIMARY KEY (contact_id)
);

CREATE TABLE IF NOT EXISTS public."Companies"
(
    company_id serial NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255),
    PRIMARY KEY (company_id)
);

CREATE TABLE IF NOT EXISTS public."Jobs_Contacts"
(
    "Jobs_job_id" serial NOT NULL,
    "Contacts_contact_id" serial NOT NULL
);

ALTER TABLE IF EXISTS public."Jobs"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES public."Users" (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Jobs"
    ADD CONSTRAINT company_id FOREIGN KEY (company_id)
    REFERENCES public."Companies" (company_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Skills"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES public."Users" (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Skills_Jobs"
    ADD FOREIGN KEY ("Skills_skill_id")
    REFERENCES public."Skills" (skill_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Skills_Jobs"
    ADD FOREIGN KEY ("Jobs_job_id")
    REFERENCES public."Jobs" (job_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Contacts"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES public."Users" (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Contacts"
    ADD CONSTRAINT company_id FOREIGN KEY (company_id)
    REFERENCES public."Companies" (company_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Jobs_Contacts"
    ADD FOREIGN KEY ("Jobs_job_id")
    REFERENCES public."Jobs" (job_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public."Jobs_Contacts"
    ADD FOREIGN KEY ("Contacts_contact_id")
    REFERENCES public."Contacts" (contact_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;