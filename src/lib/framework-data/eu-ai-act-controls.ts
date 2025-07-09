export const euAiActControlCategories = [
  {
    categoryId: "1",
    title: "AI Literacy and Responsible AI Training",
    description: "Ensure AI literacy and responsible AI training across the organization.",
    orderIndex: 1,
    controls: [
      {
        controlId: "1.1",
        title: "AI Literacy and Responsible AI Training",
        description: "Establish AI literacy and responsible AI training programs",
        orderIndex: 1,
        subcontrols: [
          {
            subcontrolId: "1.1.1",
            title: "Executive Leadership Responsibility",
            description: "We ensure executive leadership takes responsibility for decisions related to AI risks",
            orderIndex: 1
          },
          {
            subcontrolId: "1.1.2",
            title: "AI Literacy Training",
            description: "We provide AI literacy and ethics training to relevant personnel",
            orderIndex: 2
          },
          {
            subcontrolId: "1.1.3",
            title: "Communication Plan",
            description: "We develop a clear and concise communication plan for informing workers about the use of high-risk AI systems",
            orderIndex: 3
          }
        ]
      },
      {
        controlId: "1.2",
        title: "Regulatory Training and Response Procedures",
        description: "Establish regulatory training and response procedures",
        orderIndex: 2,
        subcontrols: [
          {
            subcontrolId: "1.2.1",
            title: "Roles and Responsibilities",
            description: "We clearly define roles and responsibilities related to AI risk management",
            orderIndex: 1
          },
          {
            subcontrolId: "1.2.2",
            title: "Regulatory Training",
            description: "We train personnel on the requirements of the regulation and the process for responding to requests",
            orderIndex: 2
          }
        ]
      }
    ]
  },
  {
    categoryId: "2",
    title: "Transparency and Provision of Information to Deployers",
    description: "Ensure transparency in AI system deployment and information provision.",
    orderIndex: 2,
    controls: [
      {
        controlId: "2.1",
        title: "Intended Use Description",
        description: "Provide detailed descriptions of AI system intended use",
        orderIndex: 1,
        subcontrols: [
          {
            subcontrolId: "2.1.1",
            title: "Intended Use Documentation",
            description: "We provide detailed descriptions of the AI system's intended use",
            orderIndex: 1
          }
        ]
      },
      {
        controlId: "2.2",
        title: "Technical Documentation Review",
        description: "Review and verify technical documentation",
        orderIndex: 2,
        subcontrols: [
          {
            subcontrolId: "2.2.1",
            title: "Documentation Review",
            description: "We review and verify technical documentation from providers",
            orderIndex: 1
          }
        ]
      },
      {
        controlId: "2.3",
        title: "Record Maintenance of AI System Activities",
        description: "Maintain accurate records of AI system activities",
        orderIndex: 3,
        subcontrols: [
          {
            subcontrolId: "2.3.1",
            title: "Activity Records",
            description: "We maintain accurate records of all AI system activities, including modifications and third-party involvements",
            orderIndex: 1
          }
        ]
      },
      {
        controlId: "2.4",
        title: "System Information Documentation",
        description: "Document system information comprehensively",
        orderIndex: 4,
        subcontrols: [
          {
            subcontrolId: "2.4.1",
            title: "System Information",
            description: "We document system information, including functionality, limitations, and risk controls",
            orderIndex: 1
          },
          {
            subcontrolId: "2.4.2",
            title: "Forbidden Uses",
            description: "We define and document forbidden uses and foresee potential misuse",
            orderIndex: 2
          }
        ]
      }
    ]
  },
  {
    categoryId: "3",
    title: "Human Oversight",
    description: "Establish effective human oversight mechanisms for AI systems.",
    orderIndex: 3,
    controls: [
      {
        controlId: "3.1",
        title: "Human Intervention Mechanisms",
        description: "Define mechanisms for human intervention in AI operations",
        orderIndex: 1,
        subcontrols: [
          {
            subcontrolId: "3.1.1",
            title: "Intervention Mechanisms",
            description: "We define mechanisms for human intervention or override of AI outputs",
            orderIndex: 1
          },
          {
            subcontrolId: "3.1.2",
            title: "Competent Oversight",
            description: "We assign competent individuals with authority to oversee AI system usage",
            orderIndex: 2
          },
          {
            subcontrolId: "3.1.3",
            title: "Oversight Alignment",
            description: "We align oversight measures with provider's instructions for use",
            orderIndex: 3
          }
        ]
      },
      {
        controlId: "3.2",
        title: "Oversight Documentation",
        description: "Document oversight processes and limitations",
        orderIndex: 2,
        subcontrols: [
          {
            subcontrolId: "3.2.1",
            title: "Limitation Documentation",
            description: "We document system limitations and human oversight options",
            orderIndex: 1
          },
          {
            subcontrolId: "3.2.2",
            title: "Appeal Processes",
            description: "We establish appeal processes related to AI system decisions",
            orderIndex: 2
          }
        ]
      }
    ]
  }
  // Additional control categories would be added here following the same pattern...
];