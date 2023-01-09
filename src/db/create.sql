CREATE TABLE logs (
    timestamp TEXT NOT NULL,
    data VARCHAR,
    PRIMARY KEY (time)
);

CREATE TABLE verify_settings (
    gid VARCHAR NOT NULL,
    join_ch VARCHAR,
    roles TEXT [],
    autogreet BOOLEAN,
    PRIMARY KEY (gid)
);

CREATE TABLE verify_entry (
    id INTEGER NOT NULL,
    gid VARCHAR NOT NULL,
    uid VARCHAR NOT NULL,
    nick VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE log_settings (
    gid VARCHAR NOT NULL,
    t_log_ch VARCHAR,
    i_log_ch VARCHAR,
    PRIMARY KEY (gid)
);

CREATE TABLE channel_settings (
    gid VARCHAR NOT NULL,
    media_only TEXT [] NOT NULL,
    exempted_roles TEXT [] NOT NULL,
    PRIMARY KEY (gid)
);