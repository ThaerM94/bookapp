DROP TABLE IF EXISTS booky ;
CREATE TABLE booky (
     id SERIAL PRIMARY KEY ,
   title  varchar(255),
    authors varchar(255),
    img varchar(255),
    description TEXT
);