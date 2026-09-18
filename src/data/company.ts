/**
 * Every string here is transcribed from the Dwellers Engineering
 * official business profile. Nothing is invented — if a fact is not
 * in the profile, it is not on this site.
 */

export const company = {
  name: 'Dwellers Engineering',
  legalName: 'Dwellers Engineering (Pvt) Ltd',
  tagline: 'Building with Integrity, Engineering with Excellence.',
  phone: '+94 76 793 4836',
  phoneHref: '+94767934836',
  email: 'chamara@dwellers.com',
  website: 'www.dwellerseng.com',
  address: {
    line1: 'No. 54/3, Kudabuthgamuwa',
    line2: 'Angoda',
    country: 'Sri Lanka',
  },
} as const

export const about = {
  lead: 'Dwellers Engineering (Pvt) Ltd is a professionally managed engineering and construction company established with a clear vision of delivering reliable, cost-effective, and high-quality solutions to the built environment.',
  body: [
    'Guided by sound engineering principles and industry best practices, we provide comprehensive end-to-end services — from concept development and design through construction and final project delivery.',
    'Our approach is founded on a thorough understanding of client requirements, technical excellence, and a strong commitment to quality, safety, and sustainability. By integrating modern technologies, skilled professionals, and efficient management systems, we consistently create long-term value for our clients and stakeholders while contributing positively to the advancement of the construction industry.',
  ],
} as const

export const visionMission = [
  {
    key: 'vision',
    label: 'Vision',
    text: 'To be a trusted and respected engineering and construction partner, recognized for technical excellence, reliability, and sustainable development solutions.',
  },
  {
    key: 'mission',
    label: 'Mission',
    text: 'Our mission is to deliver high quality engineering and construction services by building lasting client relationships, adhering strictly to industry standards, ensuring safety and sustainability in every operation, and completing projects on time and within budget.',
  },
] as const

export const directorsMessage = [
  'At Dwellers Engineering, we believe that true success is founded on trust, integrity, and a legacy of consistent excellence. Our commitment extends far beyond project delivery. It is rooted in cultivating enduring partnerships and creating meaningful, lasting impact through every engagement.',
  'We approach each collaboration with a deep sense of responsibility and purpose, aligning our success with that of our clients. By delivering exceptional value and contributing positively to the communities we serve, we strive to set new benchmarks in performance, reliability, and long-term sustainability.',
] as const

export type Person = {
  name: string
  role: string
  title: string
  bio: string
  portrait?: string
}

export const directors: Person[] = [
  {
    name: 'Mr. Chamara Mallawaarachchi',
    role: 'Executive Director',
    title: 'Operations & Project Execution',
    bio: 'Mr. Mallawaarachchi brings extensive experience in engineering operations, project execution, and organizational leadership. His expertise includes planning, coordination, and delivery of complex construction projects, with a strong focus on quality, efficiency, and client satisfaction. His strategic oversight and hands-on management approach play a pivotal role in driving operational excellence and sustainable growth.',
    portrait: '/assets/img/director-chamara',
  },
  {
    name: 'Eng. Chaminda Sembakutti',
    role: 'Executive Director',
    title: 'Project Management & Structures',
    bio: 'Mr. Sembakutti is a highly experienced professional specializing in project management, engineering operations, structural coordination and stakeholder engagement. His expertise includes planning and execution of complex construction projects and supervision of projects ranging from residential developments to high-rise buildings. His commitment to precision, quality assurance, and technical excellence strengthens the company’s ability to deliver reliable and efficient construction solutions.',
    portrait: '/assets/img/director-chaminda',
  },
]

export const technicalExpertise: Person[] = [
  {
    name: 'Arch. Samantha Rajaranthne',
    role: 'Architect',
    title: 'Chartered Architect',
    bio: 'Chartered Architect with extensive experience in building design, interior design, and landscape architecture. His professional expertise ensures that all projects reflect creativity, functionality, and compliance with industry standards.',
  },
  {
    name: 'Eng. Chaminda Sembakutti',
    role: 'Structural Engineer',
    title: 'MSc Foundation Engineering',
    bio: 'A highly experienced Structural Engineer holding a Master’s degree in Foundation Engineering. His expertise covers residential, low-rise, medium-rise, and high-rise buildings. He possesses extensive experience in structural design, piling works, MEP coordination, and infrastructure development through his involvement with leading organizations in the country.',
  },
]

export const teamStatement = [
  'At Dwellers Engineering, our greatest asset is our people. Our team of expert engineers, technical specialists, and seasoned professionals brings a powerful blend of hands-on experience and forward-thinking innovation to every project we undertake.',
  'Driven by excellence, we continuously invest in cutting-edge technologies, industry-leading training, and professional development to stay ahead in a rapidly evolving market. This commitment enables us to deliver smart, efficient, and future-ready engineering solutions that exceed client expectations.',
  'With a strong culture of expertise, innovation, and reliability, Dwellers Engineering stands as a trusted partner in delivering high-performance results across every project.',
] as const

/** The seven services, in profile order. Codes follow CSI-style
 *  discipline prefixes so the list reads as a drawing index. */
export const services = [
  { code: 'C-01', name: 'Civil and Structural Engineering Works' },
  { code: 'C-02', name: 'Building Construction and Renovation' },
  { code: 'A-03', name: 'Architectural and Structural Design Coordination' },
  { code: 'P-04', name: 'Project Management and Contract Administration' },
  { code: 'F-05', name: 'Interior Fit-Out and Finishing Works' },
  { code: 'I-06', name: 'Infrastructure Development' },
  { code: 'E-07', name: 'Engineering Consultancy Services' },
] as const

/** The six process stages. These map 1:1 onto the phases of the
 *  3D build sequence — the drawing and the model tell one story. */
export const process = [
  { step: 'Client Requirement Analysis' },
  { step: 'Concept Development and Planning' },
  { step: 'Design Coordination and Cost Optimization' },
  { step: 'Construction and Implementation' },
  { step: 'Quality Control and Safety Management' },
  { step: 'Project Handover and Post Completion Support' },
] as const

export const divisions = [
  {
    label: 'Core Engineering Division',
    body: [
      'Dwellers Engineering (Pvt) Ltd undertakes a broad range of civil, structural, and building engineering projects. We manage assignments from initial planning and design through construction and commissioning.',
      'Our operational philosophy emphasizes reliability, transparency, efficiency, and client satisfaction — ensuring smooth project execution with minimal risk and maximum value.',
    ],
  },
  {
    label: 'Operational Strategy',
    body: [
      'Our operations are structured to maintain effective control over quality, cost, and time. Where appropriate, we adopt integrated in-house execution strategies to enhance coordination and reduce reliance on external parties.',
      'Strategic collaborations and joint ventures are pursued to expand capacity and deliver specialized technical solutions when required.',
    ],
  },
] as const

export const coreValues = [
  { name: 'Integrity', text: 'Conducting business with honesty and transparency' },
  { name: 'Quality', text: 'Delivering excellence in every project' },
  { name: 'Safety', text: 'Ensuring a safe working environment at all times' },
  { name: 'Innovation', text: 'Embracing modern technology and improved practices' },
  { name: 'Teamwork', text: 'Achieving success through collaboration and mutual respect' },
] as const

export const sustainability = {
  title: 'Sustainability and Responsibility',
  body: [
    'Sustainability lies at the heart of Dwellers Engineering’s strategic vision. We are deeply committed to responsible resource stewardship, environmentally conscious construction methodologies, and uncompromising adherence to the highest standards of health, safety, and regulatory compliance.',
    'Guided by a philosophy of continuous innovation and operational excellence, we seamlessly integrate sustainable practices into every aspect of our work. Our approach is designed not only to minimize environmental impact but also to create enduring value — delivering sophisticated, future-ready solutions that benefit our clients, communities, and the environment alike.',
  ],
} as const

/** Section register — drives the nav, the grid bubbles and the
 *  sheet numbering. Letters are the column grid references. */
export const sections = [
  { id: 'build',          grid: 'A', sheet: '01', nav: 'The Build' },
  { id: 'about',          grid: 'B', sheet: '02', nav: 'About' },
  { id: 'services',       grid: 'C', sheet: '03', nav: 'Services' },
  { id: 'method',         grid: 'D', sheet: '04', nav: 'Method' },
  { id: 'leadership',     grid: 'E', sheet: '05', nav: 'Leadership' },
  { id: 'values',         grid: 'F', sheet: '06', nav: 'Values' },
  { id: 'sustainability', grid: 'G', sheet: '07', nav: 'Sustainability' },
  { id: 'contact',        grid: 'H', sheet: '08', nav: 'Contact' },
] as const
