import { pgPool } from "./client";

async function run() {
  await pgPool.query(`
    create table if not exists users (
      id serial primary key,
      phone varchar(20) not null unique,
      credits integer not null default 0,
      created_at timestamp not null default now()
    );
  `);
  await pgPool.query(`
    create table if not exists sessions (
      id serial primary key,
      user_id integer not null,
      token text not null unique,
      expires_at timestamp not null,
      created_at timestamp not null default now()
    );
  `);
  await pgPool.query(`
    create table if not exists otps (
      id serial primary key,
      phone varchar(20) not null,
      code varchar(10) not null,
      expires_at timestamp not null,
      consumed boolean not null default false,
      created_at timestamp not null default now()
    );
  `);
  await pgPool.query(`
    create table if not exists request_logs (
      id serial primary key,
      request_id varchar(64) not null,
      method varchar(10) not null,
      path text not null,
      query text not null default '',
      status integer not null,
      user_id integer,
      ip varchar(100) not null default '',
      user_agent text not null default '',
      request_body text not null default '',
      duration_ms integer not null default 0,
      created_at timestamp not null default now()
    );
  `);
  await pgPool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
