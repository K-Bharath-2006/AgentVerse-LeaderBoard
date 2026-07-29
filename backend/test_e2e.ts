const API_URL = 'http://localhost:5000/api';

async function request(endpoint: string, method: string, body?: any, token?: string) {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Cookie'] = `jwt=${token}`;
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  let data;
  try {
    data = await res.json();
  } catch(e) {
    data = await res.text();
  }
  
  const cookies = res.headers.get('set-cookie');
  let resToken = token;
  if (cookies) {
    const match = cookies.match(/jwt=([^;]+)/);
    if (match) resToken = match[1];
  }
  
  return { status: res.status, data, token: resToken };
}

async function runTests() {
  console.log('--- STARTING E2E TESTS ---');
  
  // 1. Admin Login
  console.log('\n1. Admin Login');
  let res = await request('/auth/login', 'POST', { email: 'admin@sece.ac.in', password: 'admin123' });
  console.log(res.status, res.data);
  const adminToken = res.token;

  console.log('\n1.5 Start Event');
  res = await request('/admin/event/start', 'POST', {}, adminToken);
  console.log(res.status, res.data);
  
  // 2. Student Login
  console.log('\n2. Student 1 Login');
  res = await request('/auth/login', 'POST', { email: 'student1@sece.ac.in', password: 'student123' });
  console.log(res.status, res.data);
  const student1Token = res.token;

  console.log('\n3. Student 2 Login');
  res = await request('/auth/login', 'POST', { email: 'student2@sece.ac.in', password: 'student123' });
  console.log(res.status, res.data);
  const student2Token = res.token;
  const student2Id = res.data._id;

  // 4. Create Team (Student 1)
  console.log('\n4. Create Team');
  res = await request('/teams', 'POST', {
    name: 'Test Team'
  }, student1Token);
  console.log(res.status, res.data);
  
  // 5. Add Member (Student 2 joining)
  const teamCode = res.data?.joinCode; // fix field name
  
  if (teamCode) {
    console.log('\n5. Join Team', teamCode);
    res = await request('/teams/join', 'POST', {
      joinCode: teamCode // it might be joinCode instead of teamCode in request body? Let's check team.validator.ts. It's joinCode.
    }, student2Token);
    console.log(res.status, res.data);
  } else {
    console.log('No team code returned', res.data);
  }

  res = await request('/agents', 'POST', {
    agentName: 'Test Agent',
    theme: 'Autonomous AI',
    shortDescription: 'This is a test agent that does something cool and has at least fifty characters of text content.',
    githubUrl: 'https://github.com/test/test',
    liveDemoUrl: 'https://test.com',
    videoDemoUrl: 'https://youtube.com/test',
    documentationUrl: 'https://docs.com/test',
    llmUsed: 'OpenAI',
    framework: 'LangChain',
    facultyMentor: 'Dr. Mentor',
    techStack: ['React', 'Node']
  }, student1Token);
  console.log(res.status, res.data);
  const agentId = res.data?.agent?._id || res.data?._id;

  if (agentId) {
    // 7. Admin Approve Agent
    console.log('\n7. Admin Approve Agent');
    res = await request(`/admin/agents/${agentId}/status`, 'PUT', { status: 'approved' }, adminToken);
    console.log(res.status, res.data);
    
    // 8. Jury Login & Score
    console.log('\n8. Jury Login');
    res = await request('/auth/login', 'POST', { juryId: 'FAC100', password: 'jury123' });
    console.log(res.status, res.data);
    const juryToken = res.token;
    
    // Get team ID for scoring
    res = await request('/jury/teams', 'GET', undefined, juryToken);
    console.log('\nTeams for Jury:', res.status, res.data);
    const teamId = res.data?.[0]?._id;
    
    if (teamId) {
        console.log('\n9. Jury Score Team');
        res = await request('/jury/score', 'POST', { teamId, score: 85, remarks: 'Good job' }, juryToken);
        console.log(res.status, res.data);
    }
  }

  // 10. Check Leaderboard
  console.log('\n10. Check Leaderboard');
  res = await request('/public/leaderboard', 'GET');
  console.log(res.status, res.data);

}

runTests().catch(console.error);
