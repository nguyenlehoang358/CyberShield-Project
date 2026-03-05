import{c as n,j as e,L as c,A as s}from"./index-RSLkVF8n.js";/* empty css                  */const r=n("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]]),a=n("Tag",[["path",{d:"M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z",key:"14b2ls"}],["path",{d:"M7 7h.01",key:"7u93v4"}]]),o=n("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),h=[{id:"security-101",title:"Nhập môn An toàn thông tin: Bắt đầu từ đâu?",desc:"Hướng dẫn lộ trình học cybersecurity cho người mới bắt đầu. Các chứng chỉ cần thiết và kỹ năng nền tảng.",author:"Admin",date:"2024-02-15",tags:["Beginner","Career"],content:`
# Nhập môn An toàn thông tin

An toàn thông tin (Cybersecurity) là lĩnh vực bảo vệ hệ thống, mạng và chương trình khỏi các cuộc tấn công kỹ thuật số.

## Lộ trình cơ bản

1. **Networking**: Hiểu về TCP/IP, OSI Model, DNS, HTTP/HTTPS.
2. **Operating Systems**: Thành thạo Linux (Kali, Ubuntu) và Windows internals.
3. **Coding**: Python, Bash scripting, JavaScript (cho web security).
4. **Tools**: Nmap, Burp Suite, Wireshark, Metasploit.

## Chứng chỉ gợi ý

- **CompTIA Security+**: Kiến thức nền tảng.
- **CEH (Certified Ethical Hacker)**: Kỹ thuật tấn công/phòng thủ.
- **OSCP (Offensive Security Certified Professional)**: Thực hành penetration testing (rất khó & uy tín).

## Tài nguyên học tập

- [TryHackMe](https://tryhackme.com)
- [HackTheBox](https://hackthebox.com)
- [OWASP Top 10](https://owasp.org)
        `},{id:"owasp-top-10",title:"Phân tích OWASP Top 10 (2024 Edition)",desc:"Chi tiết về 10 lỗ hổng bảo mật web phổ biến nhất hiện nay và cách phòng chống.",author:"Security Team",date:"2024-02-10",tags:["Web Security","OWASP"],content:`
# OWASP Top 10 - Web Application Security Risks

1. **A01: Broken Access Control**
   - Người dùng truy cập được dữ liệu của người khác hoặc thực hiện hành động admin.
   - *Fix:* Phân quyền chặt chẽ (RBAC), deny by default.

2. **A02: Cryptographic Failures**
   - Dữ liệu nhạy cảm (passwords, PII) không được mã hóa hoặc dùng thuật toán yếu.
   - *Fix:* Dùng TLS 1.3, Argon2/Bcrypt cho password.

3. **A03: Injection**
   - SQL Injection, Command Injection.
   - *Fix:* Dùng Prepared Statements, Parameterized Queries.

4. **A04: Insecure Design**
   - Lỗi logic thiết kế ngay từ đầu.
   - *Fix:* Threat modeling, secure design patterns.

... (còn tiếp)
        `},{id:"docker-security",title:"Best Practices cho Docker Security",desc:"Cách build container an toàn, giảm thiểu bề mặt tấn công trong môi trường DevOps.",author:"DevOps Lead",date:"2024-01-28",tags:["Docker","DevSecOps"],content:`
# Docker Security Best Practices

1. **Don't run as Root**
   Luôn tạo user riêng trong Dockerfile:
   \`\`\`dockerfile
   RUN addgroup -S appgroup && adduser -S appuser -G appgroup
   USER appuser
   \`\`\`

2. **Use Minimal Base Images**
   Dùng \`alpine\` hoặc \`distroless\` để giảm kích thước và vulnerabilities.

3. **Scan Images regularly**
   Dùng tools như Trivy, Clair để scan image trước khi deploy.

4. **Limit Resources**
   Set CPU/Memory limits để tránh DoS attack từ bên trong container.
        `}];function l(t){try{return new Date(t).toLocaleDateString()}catch{return t}}function u(){return e.jsxs("div",{className:"eco-container",children:[e.jsxs("header",{style:{marginBottom:"3rem",textAlign:"center"},children:[e.jsx("h1",{className:"eco-title-gradient",children:"Knowledge Base"}),e.jsx("p",{className:"eco-subtitle",children:"Chia sẻ kiến thức về An toàn thông tin, DevOps và lập trình."})]}),e.jsx("div",{className:"blog-grid",children:h.map(t=>e.jsx("article",{className:"blog-card",children:e.jsxs("div",{className:"blog-content",children:[e.jsxs("div",{className:"blog-meta",children:[e.jsx(r,{size:14})," ",l(t.date),e.jsx("span",{children:"•"}),e.jsx(o,{size:14})," ",t.author]}),e.jsx("h2",{className:"blog-title",children:e.jsx(c,{to:`/blog/${t.id}`,style:{color:"inherit",textDecoration:"none"},children:t.title})}),e.jsx("p",{className:"blog-excerpt",children:t.desc}),e.jsxs("div",{className:"blog-footer",children:[e.jsx("div",{className:"blog-tags",children:t.tags.slice(0,2).map(i=>e.jsxs("span",{className:"blog-tag",children:[e.jsx(a,{size:10,style:{marginRight:"4px"}})," ",i]},i))}),e.jsxs(c,{to:`/blog/${t.id}`,className:"blog-link",children:["Read ",e.jsx(s,{size:14})]})]})]})},t.id))})]})}export{u as default};
