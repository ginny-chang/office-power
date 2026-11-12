import React from 'react';
import githubLogo from '../src-projects/logos/github.svg';
import gitlabLogo from '../src-projects/logos/gitlab.svg';
import jiraLogo from '../src-projects/logos/jira.svg';
import slackLogo from '../src-projects/logos/slack.svg';
import driveLogo from '../src-projects/logos/googledrive.svg';
import postgresLogo from '../src-projects/logos/postgresql.svg';

const marks={github:githubLogo,gitlab:gitlabLogo,jira:jiraLogo,slack:slackLogo,drive:driveLogo,postgres:postgresLogo};
export const providerIds=Object.keys(marks);
export default function ProviderLogo({id}){const src=marks[id];if(!src)return null;return <img className="provider-logo" src={src} alt="" width={22} height={22}/>}
