import * as core from '@actions/core';
import * as github from '@actions/github';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

// async function getReferencedEpics({ octokit }) {
// 	const epicLabelName = core.getInput('epic-label-name', { required: true });

// 	const events = await octokit.issues.listEventsForTimeline({
// 		owner: github.context.repo.owner,
// 		repo: github.context.repo.repo,
// 		issue_number: github.context.payload.issue.number
// 	});

// 	const referencedEpics = events.data
// 		.filter((item) => (item.event === 'cross-referenced' && item.source))
// 		.filter((item) => item.source.issue.labels
// 			.filter((label) => label.name.toLowerCase() === epicLabelName.toLowerCase()).length > 0);

// 	return referencedEpics;
// }

// async function updateEpic({ octokit, epic }) {
// 	const issueNumber = github.context.payload.issue.number;
// 	const issueState = github.context.payload.issue.state;
// 	const convertedIssueState = issueState === 'closed' ? 'x' : ' ';
// 	const epicNumber = epic.source.issue.number;
// 	let epicBody = epic.source.issue.body;

// 	const pattern = new RegExp(`- \\[[ |x]\\] .*#${issueNumber}.*`, 'gm');
// 	const matches = epicBody.matchAll(pattern);

// 	// eslint-disable-next-line no-restricted-syntax
// 	for (const match of matches) {
// 		epicBody = epicBody.replace(match[0], match[0].replace(/- \[[ |x]\]/, `- [${convertedIssueState}]`));
// 	}

// 	const result = await octokit.issues.update({
// 		owner: github.context.repo.owner,
// 		repo: github.context.repo.repo,
// 		issue_number: epicNumber,
// 		body: epicBody
// 	});

// 	return result;
// }

// async function updateEpics({ octokit, epics }) {
// 	return Promise.all(epics.map((epic) => updateEpic({ octokit, epic })));
// }

// Load the configuration file
async function loadConfig(client, repoPath) {
	const response = await client.repos.getContents({
		owner: github.context.repo.owner,
		repo: github.context.repo.repo,
		path: repoPath,
		ref: github.context.sha
	});

	const data = response.data;
	if (!data.content) {
		console.log('The configuration path provided is not a valid file. Exiting');
	}
	//const fileContent = Buffer.from(data.content, 'base64').toString('utf8');
	const fileContent = await fs.readFile(repoPath, 'utf8');
	return yaml.safeLoad(fileContent);
}

async function run() {
	try {
		const configPath = core.getInput('config-path', { required: true });
		const token = core.getInput('github-token', { required: true });

		const octokit = new github.GitHub(token);
		const config = loadConfig(octokit, configPath);
		console.log('+++++ CONFIG +++++');
		console.log(JSON.stringify(config));
		// const epics = await getReferencedEpics({ octokit });
		// await updateEpics({ octokit, epics });
	} catch (error) {
		core.error(error);
		core.setFailed(error.message);
	}
}

run();
