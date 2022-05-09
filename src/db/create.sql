CREATE TABLE DebugLogs (
    time INTEGER NOT NULL,
    data VARCHAR,
    PRIMARY KEY (time)
);

CREATE TABLE VerifySettings (
    gid VARCHAR NOT NULL,
    join_ch VARCHAR,
    roles TEXT [],
    autogreet BOOLEAN,
    PRIMARY KEY (gid)
);

CREATE TABLE VerifyEntry (
    id INTEGER NOT NULL,
    gid VARCHAR NOT NULL,
    uid VARCHAR NOT NULL,
    nick VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE LogSettings (
    gid VARCHAR NOT NULL,
    t_log_ch VARCHAR,
    i_log_ch VARCHAR,
    PRIMARY KEY (gid)
);

CREATE TABLE ChannelSettings (
    gid VARCHAR NOT NULL,
    media_only: TEXT [] NOT NULL,
    PRIMARY KEY (gid)
);