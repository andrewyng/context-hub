---
name: cdk
description: "AWS Cloud Development Kit (CDK) v2 — comprehensive infrastructure as code guide with constructs, stacks, Lambda, security patterns, and deployment"
metadata:
  languages: "typescript"
  versions: "2.243.0"
  revision: 1
  updated-on: "2026-03-19"
  source: community
  tags: "aws,cdk,cloud,infrastructure,iac"
---

# AWS CDK v2 Coding Guide

This guide provides instructions for generating AWS Cloud Development Kit (CDK) v2 code to model, synthesize, test, and deploy cloud infrastructure using Constructs and Stacks.

## Golden Rules

1. Use high-level L2 constructs from the official construct library `aws-cdk-lib` and well-maintained community constructs rather than hand-rolling raw CloudFormation whenever possible.
2. Follow least privilege principles when granting IAM permissions.
3. Use Alpha packages only when authorized by the user.

## Installation

### Basic Installation

```bash
npm install -g aws-cdk
```

## Initialization

### Basic CDK App Setup

```bash
mkdir my-cdk-app && cd my-cdk-app
cdk init app --language typescript
```

**Project structure:**
```
my-cdk-app/
├── bin/
│   └── my-cdk-app.ts        # App entry point
├── lib/
│   └── my-cdk-app-stack.ts  # Stack definition
├── test/
│   └── my-cdk-app.test.ts   # Unit tests
├── cdk.json                  # CDK configuration
├── package.json
├── tsconfig.json
└── .gitignore
```

### Environment Variables and AWS Access

**Recommended:** When generating CDK projects, configure the AWS CLI with SSO named profiles instead of static credentials.

```bash
# Use named profile
export AWS_PROFILE=my-sso-profile

# Optional: Set default region
export AWS_REGION=us-east-1
```

### Minimal App Entry

**bin/my-cdk-app.ts:**
```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { MyStack } from '../lib/my-cdk-app-stack';

const app = new App();

new MyStack(app, 'MyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
```

### Minimal Stack

**lib/my-cdk-app-stack.ts:**
```typescript
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'MyBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
```

### Advanced Stack with Environment Configuration

```typescript
import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface MyStackProps extends StackProps {
  readonly stage: string;
  readonly appName: string;
}

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    // Add tags to all resources in this stack
    Tags.of(this).add('Environment', props.stage);
    Tags.of(this).add('Application', props.appName);
    Tags.of(this).add('ManagedBy', 'CDK');

    // Resource definitions here...
  }
}
```

## Additional CDK Libraries

Beyond the core `aws-cdk-lib`, AWS provides specialized libraries for specific use cases. Always ask the user for permission before using experimental (Alpha) packages or specialized libraries.

### Alpha Packages (Experimental Higher-Level Constructs)

The AWS CDK has higher-level constructs in experimental *Alpha* stage under active development. Install only the packages you need when authorized by the user:

| Package | Purpose |
|---------|---------|
| `aws-amplify-alpha` | AWS Amplify application constructs |
| `aws-applicationsignals-alpha` | CloudWatch Application Signals constructs |
| `aws-apprunner-alpha` | AWS App Runner service constructs |
| `aws-bedrock-agentcore-alpha` | Bedrock AgentCore primitives |
| `aws-bedrock-alpha` | Amazon Bedrock constructs |
| `aws-cloud9-alpha` | AWS Cloud9 environment constructs |
| `aws-codestar-alpha` | AWS CodeStar constructs |
| `aws-ec2-alpha` | EC2 VPC V2 and advanced networking constructs |
| `aws-elasticache-alpha` | Amazon ElastiCache constructs |
| `aws-gamelift-alpha` | Amazon GameLift constructs |
| `aws-glue-alpha` | AWS Glue job and database constructs |
| `aws-imagebuilder-alpha` | EC2 Image Builder constructs |
| `aws-iot-actions-alpha` | IoT rule actions |
| `aws-iot-alpha` | AWS IoT constructs |
| `aws-iotevents-alpha` | AWS IoT Events detector model constructs |
| `aws-iotevents-actions-alpha` | AWS IoT Events actions |
| `aws-ivs-alpha` | Amazon Interactive Video Service constructs |
| `aws-kinesisanalytics-flink-alpha` | Kinesis Analytics Flink applications |
| `aws-lambda-go-alpha` | Constructs for Go Lambda functions |
| `aws-lambda-python-alpha` | Constructs for Python Lambda functions |
| `aws-location-alpha` | Amazon Location Service constructs |
| `aws-msk-alpha` | Managed Streaming for Kafka (MSK) |
| `aws-neptune-alpha` | Neptune database clusters |
| `aws-pipes-alpha` | EventBridge Pipes constructs |
| `aws-pipes-enrichments-alpha` | EventBridge Pipes enrichments |
| `aws-pipes-sources-alpha` | EventBridge Pipes sources |
| `aws-pipes-targets-alpha` | EventBridge Pipes targets |
| `aws-redshift-alpha` | Redshift cluster constructs |
| `aws-route53resolver-alpha` | Route 53 Resolver constructs |
| `aws-s3objectlambda-alpha` | S3 Object Lambda access point constructs |
| `aws-s3tables-alpha` | S3 Tables constructs |
| `aws-sagemaker-alpha` | SageMaker model and endpoint constructs |
| `aws-servicecatalogappregistry-alpha` | Service Catalog AppRegistry constructs |
| `integ-tests-alpha` | Integration testing framework for CDK |

Installation example:

```bash
# Install specific Alpha packages as needed
npm install @aws-cdk/aws-lambda-python-alpha
```

### Generative AI CDK Constructs

The `@cdklabs/generative-ai-cdk-constructs` library provides higher-level L2 and L3 constructs for building generative AI applications on AWS. These constructs simplify common patterns for working with Amazon Bedrock, agents, and related services.

**When to use:** Always ask the user for permission before using this library. Use these constructs to avoid working with low-level L1 Bedrock constructs directly.

**Installation:**

```bash
npm install @cdklabs/generative-ai-cdk-constructs
```

**Example: Bedrock Guardrails**

Bedrock Guardrails help you implement safeguards for generative AI applications. Here's a comparison of L1 (CloudFormation) vs L2 (generative-ai-cdk-constructs) approaches:

**L1 Construct (Low-level, verbose):**

```typescript
import * as bedrock from 'aws-cdk-lib/aws-bedrock';

const guardrail = new bedrock.CfnGuardrail(this, 'MyGuardrail', {
  name: 'my-guardrail',
  description: 'Guardrail for content filtering',
  contentPolicyConfig: {
    filtersConfig: [
      {
        type: 'SEXUAL',
        inputStrength: 'HIGH',
        outputStrength: 'HIGH',
      },
      {
        type: 'VIOLENCE',
        inputStrength: 'HIGH',
        outputStrength: 'HIGH',
      },
      {
        type: 'HATE',
        inputStrength: 'MEDIUM',
        outputStrength: 'MEDIUM',
      },
      {
        type: 'INSULTS',
        inputStrength: 'MEDIUM',
        outputStrength: 'MEDIUM',
      },
      {
        type: 'MISCONDUCT',
        inputStrength: 'MEDIUM',
        outputStrength: 'MEDIUM',
      },
      {
        type: 'PROMPT_ATTACK',
        inputStrength: 'HIGH',
        outputStrength: 'HIGH',
      },
    ],
  },
  topicPolicyConfig: {
    topicsConfig: [
      {
        name: 'Politics',
        definition: 'Political discussions and elections',
        examples: ['election results', 'voting'],
        type: 'DENY',
      },
    ],
  },
  wordPolicyConfig: {
    wordsConfig: [
      {
        text: 'badword',
      },
    ],
    managedWordListConfig: [
      {
        type: 'PROFANITY',
      },
    ],
  },
});
```

**L2 Construct (High-level, concise):**

```typescript
import { Guardrail } from '@cdklabs/generative-ai-cdk-constructs';

const guardrail = new Guardrail(this, 'MyGuardrail', {
  name: 'my-guardrail',
  description: 'Guardrail for content filtering',
  contentFilters: [
    { type: 'SEXUAL', inputStrength: 'HIGH', outputStrength: 'HIGH' },
    { type: 'VIOLENCE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
    { type: 'HATE', inputStrength: 'MEDIUM', outputStrength: 'MEDIUM' },
    { type: 'INSULTS', inputStrength: 'MEDIUM', outputStrength: 'MEDIUM' },
    { type: 'MISCONDUCT', inputStrength: 'MEDIUM', outputStrength: 'MEDIUM' },
    { type: 'PROMPT_ATTACK', inputStrength: 'HIGH', outputStrength: 'HIGH' },
  ],
  topicFilters: [
    {
      name: 'Politics',
      definition: 'Political discussions and elections',
      examples: ['election results', 'voting'],
      type: 'DENY',
    },
  ],
  wordFilters: {
    customWords: ['badword'],
    managedWordLists: ['PROFANITY'],
  },
});
```

**Key benefits of L2 constructs:**
- Sensible defaults for common configurations
- Reduced boilerplate code
- Type-safe property definitions
- Built-in best practices for security and performance
- Easier to maintain and update

## Core CDK Concepts

### Construct Hierarchy

Constructs from the AWS Construct Library are categorized into three levels, each offering increasing abstraction. Higher abstraction means easier configuration with less expertise required. Lower abstraction provides more customization but requires more expertise.

**Level 1 (L1) Constructs - CFN Resources:**

L1 constructs (also known as CFN resources) are the lowest-level constructs that map directly to AWS CloudFormation resources. They are automatically generated from the AWS CloudFormation resource specification.

- Class names start with `Cfn` prefix (e.g., `s3.CfnBucket`)
- Provide complete control over resource properties
- Require explicit configuration of all properties
- Best when you need exact CloudFormation parity
- Generated weekly from CloudFormation specs

```typescript
// L1 construct - explicit CloudFormation properties
const cfnBucket = new s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-bucket',
  versioningConfiguration: {
    status: 'Enabled',
  },
  corsConfiguration: {
    corsRules: [{
      allowedOrigins: ['*'],
      allowedMethods: ['GET'],
    }],
  },
});
```

**Level 2 (L2) Constructs - Curated Constructs:**

L2 constructs (also known as curated constructs) are thoughtfully developed by the AWS CDK team. They provide intent-based APIs with sensible defaults and best practice security policies.

- Most widely used construct type
- Intuitive, high-level API over CloudFormation
- Sensible default property configurations
- Helper methods for common operations (e.g., `bucket.grantRead()`)
- Generate boilerplate code automatically
- Include best practice security policies

```typescript
// L2 construct - sensible defaults and helper methods
const l2Bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
});

// Helper methods make permissions easy
l2Bucket.grantRead(lambdaFunction);
```

**Level 3 (L3) Constructs - Patterns:**

L3 constructs (also known as patterns) are the highest level of abstraction, representing complete AWS architectures for specific use cases. They create and configure multiple resources that work together.

- Opinionated solutions for common architectural patterns
- Configure collections of resources automatically
- Built around proven approaches to specific problems
- Require minimal code and configuration
- Create entire system designs or substantial parts

```typescript
// L3 construct - complete architecture with minimal config
import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import { EventbridgeToLambda } from '@aws-solutions-constructs/aws-eventbridge-lambda';

new EventbridgeToLambda(
  this, 
  'test-eventbridge-lambda',
  {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(`lambda`),
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler'
    },
    eventRuleProps: {
      schedule: events.Schedule.rate(Duration.minutes(5))
    }
  }
);
```

**Composition Pattern:**

Composition is the key pattern for defining higher-level abstractions. You can compose high-level constructs from lower-level constructs with as many levels as needed. This enables:

- Reusable components shared like any code library
- Company-specific best practices encapsulated in custom constructs
- Incremental improvements through library updates
- Teams defining their own abstraction levels

**Best Practice:**
- ✅ Prefer L2 constructs for most use cases
- ✅ Use L3 patterns when they match the target architecture
- ⚠️ Use L1 constructs only when L2/L3 don't exist or you need exact CloudFormation control
- ✅ Create custom L3 constructs to encapsulate project or company standards

### Stack Dependencies

Use SSM Parameters for cross-stack references to decouple stacks:

```typescript
// Producer Stack
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
    });

    // Export VPC ID via SSM Parameter
    new ssm.StringParameter(this, 'VpcIdParameter', {
      parameterName: '/myapp/vpc-id',
      stringValue: vpc.vpcId,
      description: 'VPC ID for application stacks',
    });

    new ssm.StringParameter(this, 'VpcPrivateSubnetsParameter', {
      parameterName: '/myapp/vpc-private-subnets',
      stringValue: JSON.stringify(vpc.privateSubnets.map(s => s.subnetId)),
    });
  }
}

// Consumer Stack
export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Import VPC ID from SSM Parameter
    const vpcId = ssm.StringParameter.valueForStringParameter(this, '/myapp/vpc-id');

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
      vpcId: vpcId,
    });

    // Use VPC in resources...
  }
}
```

### Removal Policies

`RemovalPolicy` controls what happens to a resource when it is removed from the stack (either by deleting the stack or removing the resource from the code). Always set an explicit removal policy for stateful resources.

| Policy | Behavior | Use When |
|--------|----------|----------|
| `RemovalPolicy.RETAIN` | Resource is kept in AWS after stack deletion | Production databases, S3 buckets with data, encryption keys, any resource with irreplaceable state |
| `RemovalPolicy.SNAPSHOT` | A snapshot is taken before deletion (RDS, ElastiCache, EBS) | Production databases where a backup is sufficient |
| `RemovalPolicy.DESTROY` | Resource is deleted with the stack | Dev/test environments, log groups, ephemeral resources, resources that can be recreated |
| `RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE` | Resource is retained on both update replacement and stack deletion | Critical stateful resources that must never be accidentally deleted |

```typescript
import { RemovalPolicy } from 'aws-cdk-lib';

// Stateful resources: RETAIN in production
new dynamodb.TableV2(this, 'UsersTable', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  removalPolicy: RemovalPolicy.RETAIN,
});

// Ephemeral resources: DESTROY for cleanup
new logs.LogGroup(this, 'AppLogs', {
  retention: logs.RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});

// RDS: SNAPSHOT for safety with recovery option
new rds.DatabaseCluster(this, 'Database', {
  // ...cluster props
  removalPolicy: RemovalPolicy.SNAPSHOT,
});
```

Rules:
- Always set `RemovalPolicy.RETAIN` for production stateful resources (DynamoDB tables, S3 buckets, RDS clusters, KMS keys).
- Use `RemovalPolicy.DESTROY` only for dev/test stacks or ephemeral resources (log groups, test buckets).
- Use `RemovalPolicy.SNAPSHOT` for databases where a backup before deletion is acceptable.
- If the user does not specify, default to `RemovalPolicy.RETAIN` for stateful resources and `RemovalPolicy.DESTROY` for log groups.

### Stack Outputs with CfnOutput

Use `CfnOutput` to export resource values (ARNs, URLs, endpoints) from a stack. These appear in the CloudFormation Outputs tab and in the `cdk deploy` terminal output.

```typescript
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Output a bucket name
new CfnOutput(this, 'BucketName', {
  value: bucket.bucketName,
  description: 'Name of the S3 bucket',
  exportName: 'MyApp-BucketName',
});

// Output an API endpoint URL
new CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'REST API endpoint URL',
});

// Output a Lambda function ARN
new CfnOutput(this, 'FunctionArn', {
  value: listFn.functionArn,
  description: 'ARN of the list function',
});
```

The `exportName` property creates a CloudFormation Export that other stacks can import using `Fn.importValue()`. Only use `exportName` when cross-stack references are needed; omit it for informational outputs.

## Common AWS Services

### API Gateway (REST)

```typescript
import { RemovalPolicy } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';

const logGroup = new logs.LogGroup(this, 'ApiLogs', {
  retention: logs.RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});

// RestApi auto-creates a Deployment and a "prod" Stage by default.
// Use `deployOptions` to configure the stage.
const api = new apigateway.RestApi(this, 'MyApi', {
  restApiName: 'My Service API',
  description: 'API for My Service',
  cloudWatchRole: true,
  deployOptions: {
    stageName: 'prod',
    metricsEnabled: true,
    loggingLevel: apigateway.MethodLoggingLevel.INFO,
    dataTraceEnabled: true,
    accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
    accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
    methodOptions: {
      '/*/*': {
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
      },
    },
  },
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

// Add API Key
const apiKey = api.addApiKey('ApiKey', {
  apiKeyName: 'my-api-key',
  description: 'API Key for external clients',
});

const usagePlan = api.addUsagePlan('UsagePlan', {
  name: 'Standard',
  throttle: {
    rateLimit: 100,
    burstLimit: 200,
  },
  quota: {
    limit: 10000,
    period: apigateway.Period.MONTH,
  },
});

usagePlan.addApiKey(apiKey);
usagePlan.addApiStage({ stage: api.deploymentStage });

// Add resources and methods
const items = api.root.addResource('items');
items.addMethod('GET', new apigateway.LambdaIntegration(listFn), {
  apiKeyRequired: true,
  requestParameters: {
    'method.request.querystring.limit': false,
  },
});

const item = items.addResource('{id}');
item.addMethod('GET', new apigateway.LambdaIntegration(getFn));
item.addMethod('PUT', new apigateway.LambdaIntegration(updateFn));
item.addMethod('DELETE', new apigateway.LambdaIntegration(deleteFn));
```

**Custom Domain with TLS 1.3 Security Policy (v2.242.0+)**

Use TLS 1.3 security policies to enforce modern cryptography standards on your custom API domains. API Gateway provides several TLS 1.3 options including post-quantum cryptography support.

```typescript
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

// Import an existing ACM certificate for your custom domain
const certificate = acm.Certificate.fromCertificateArn(
  this,
  'ApiCertificate',
  'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012'
);

// Add custom domain with TLS 1.3 security policy
// Enhanced security policies (TLS13_*) require endpointAccessMode to be specified
api.addDomainName('CustomDomain', {
  domainName: 'api.example.com',
  certificate: certificate,
  securityPolicy: apigateway.SecurityPolicy.TLS13_1_3_2025_09,
  endpointAccessMode: apigateway.EndpointAccessMode.STRICT,
});
```

**New Props, Methods and ENUMs**
| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `DomainNameOptions` | `securityPolicy` | `SecurityPolicy.TLS13_1_3_2025_09` | TLS 1.3 only — requires `endpointAccessMode` |
| `DomainNameOptions` | `securityPolicy` | `SecurityPolicy.TLS13_1_3_FIPS_2025_09` | TLS 1.3 FIPS compliant — requires `endpointAccessMode` |
| `DomainNameOptions` | `securityPolicy` | `SecurityPolicy.TLS13_1_2_PQ_2025_09` | TLS 1.3 & 1.2 with post-quantum cryptography — requires `endpointAccessMode` |
| `DomainNameOptions` | `securityPolicy` | `SecurityPolicy.TLS13_1_2_PFS_PQ_2025_09` | TLS 1.3 & 1.2 with PFS and post-quantum — requires `endpointAccessMode` |
| `DomainNameOptions` | `securityPolicy` | `SecurityPolicy.TLS13_2025_EDGE` | TLS 1.3 for edge-optimized (CloudFront) endpoints |
| `DomainNameOptions` | `endpointAccessMode` | `EndpointAccessMode.STRICT` | Required for all `TLS13_*` enhanced security policies. Recommended for production |
| `DomainNameOptions` | `endpointAccessMode` | `EndpointAccessMode.BASIC` | Alternative to `STRICT` — use during migration or for specific architectures |
| `LambdaIntegration` | `responseTransferMode` | `ResponseTransferMode.STREAM` | Streams response as received. Supported for `AWS_PROXY` integrations only |
| `LambdaIntegration` | `responseTransferMode` | `ResponseTransferMode.BUFFERED` | Default — waits for complete response before transmission |

**Response Streaming with Transfer Mode (v2.230.0+)**

Enable response streaming to allow API Gateway to stream responses back as they're received from the integration (Lambda, HTTP endpoint, etc.) rather than buffering the complete response. Useful for large payloads or real-time streaming responses.

```typescript
// Response streaming with Lambda integration
const streamingMethod = items.addMethod(
  'POST',
  new apigateway.LambdaIntegration(processFn, {
    responseTransferMode: apigateway.ResponseTransferMode.STREAM,
  }),
  {
    requestParameters: {
      'method.request.header.Content-Type': true,
    },
  }
);

// Response streaming with HTTP integration
const httpStreamingMethod = api.root.addResource('stream').addMethod(
  'GET',
  new apigateway.HttpIntegration('https://stream.example.com/data', {
    httpMethod: 'GET',
    responseTransferMode: apigateway.ResponseTransferMode.STREAM,
  })
);
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `RestApi` | `minimumCompressionSize` | Superseded by `minCompressionSize` |

### API Gateway (HTTP)

For Lambda integrations, the `HttpLambdaIntegration` is available from the stable `aws-cdk-lib/aws-apigatewayv2-integrations` module. Use it directly without installing alpha packages.

```typescript
import { RemovalPolicy } from 'aws-cdk-lib';
import { HttpUrlIntegration, HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as logs from 'aws-cdk-lib/aws-logs';

const accessLogGroup = new logs.LogGroup(this, 'HttpApiAccessLogs', {
  retention: logs.RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});

// Create a simple HTTP API
const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
  apiName: 'MyHttpApi',
  description: 'Fast HTTP API (API Gateway v2) for My Service',
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
  },
});

// Add routes using integrations
// For Lambda-backed routes install `@aws-cdk/aws-apigatewayv2-integrations` and use `HttpLambdaIntegration`.
httpApi.addRoutes({
  path: '/health',
  methods: [apigwv2.HttpMethod.GET],
  integration: new HttpUrlIntegration('HealthUrl', 'https://status.example.com/health'),
});

httpApi.addRoutes({
  path: '/something',
  methods: [apigwv2.HttpMethod.GET],
  integration: new HttpLambdaIntegration('SomethingIntegration', processFn),
});

// Configure stage-level settings and access logging by creating a stage
new apigwv2.HttpStage(this, 'ProdStage', {
  httpApi,
  stageName: 'prod',
  autoDeploy: true,
  throttle: {
    burstLimit: 200,
    rateLimit: 100,
  },
  accessLogSettings: {
    destination: new apigwv2.LogGroupLogDestination(accessLogGroup),
  },
});
```

### Cognito User Pool, Client and Domain

```typescript
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

const userPool = new cognito.UserPool(this, 'SecureUserPool', {
  userPoolName: 'secure-users',
  selfSignUpEnabled: false,
  signInAliases: { email: true },
  autoVerify: { email: true },
  passwordPolicy: {
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: true,
  },
  accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
  removalPolicy: RemovalPolicy.RETAIN,
});

userPool.addClient('AppClient', {
  oAuth: {
    flows: {
      authorizationCodeGrant: true,
    },
    scopes: [ cognito.OAuthScope.OPENID ],
    callbackUrls: [ 'https://my-app-domain.com/welcome' ],
    logoutUrls: [ 'https://my-app-domain.com/signin' ],
  },
});

const certificateArn = 'arn:aws:acm:us-east-1:123456789012:certificate/11-3336f1-44483d-adc7-9cd375c5169d';

const domainCert = acm.Certificate.fromCertificateArn(this, 'domainCert', certificateArn);
userPool.addDomain('CustomDomain', {
  customDomain: {
    domainName: 'user.myapp.com',
    certificate: domainCert,
  },
});
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `UserPool` | `advancedSecurityMode` | Advanced Security Mode is deprecated due to user pool feature plans. Use `StandardThreatProtectionMode` and `CustomThreatProtectionMode` to set Threat Protection level |

### CloudFront

**Lambda Function URL with Origin Access Control (OAC) (v2.230.0+, 2025-07-18)**

CloudFront can now directly invoke Lambda Function URLs with Origin Access Control (OAC) for secure communication. OAC provides automatic SigV4 signing of requests from CloudFront to Lambda, eliminating the need to manage permissions manually.

```typescript
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Create a Lambda function URL (must use AWS_IAM auth for OAC)
const functionUrl = myFunction.addFunctionUrl({
  authType: lambda.FunctionUrlAuthType.AWS_IAM,
});

// Create OAC for secure CloudFront-to-Lambda communication
const oac = new cloudfront.FunctionUrlOriginAccessControl(this, 'FunctionUrlOAC', {
  originAccessControlName: 'LambdaFunctionUrlOAC',
  signing: cloudfront.Signing.SIGV4_ALWAYS,
});

// Create CloudFront distribution with Lambda Function URL origin
// Use the static withOriginAccessControl() factory method on FunctionUrlOrigin
const distribution = new cloudfront.Distribution(this, 'Distribution', {
  defaultBehavior: {
    origin: cloudfrontOrigins.FunctionUrlOrigin.withOriginAccessControl(functionUrl, {
      originAccessControl: oac,
    }),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
  },
});
```

**New Props, Methods and ENUMs**
| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `FunctionUrlOriginAccessControl` | `originAccessControlName` | `string` | Optional name for the OAC resource |
| `FunctionUrlOriginAccessControl` | `signing` | `Signing.SIGV4_ALWAYS` | Always sign requests with SigV4 (recommended) |
| `FunctionUrlOriginAccessControl` | `signing` | `Signing.SIGV4_NO_OVERRIDE` | Sign only if origin does not override |
| `FunctionUrlOriginAccessControl` | `signing` | `Signing.NEVER` | Never sign requests |

| Construct | New Method | Comment |
|-----------|------------|---------|
| `FunctionUrlOrigin` | `withOriginAccessControl()` | Use instead of constructor when attaching an OAC — `FunctionUrlOrigin.withOriginAccessControl(fnUrl, { originAccessControl: oac })` |

### DynamoDB Table (TableV2)

The recommended construct for new DynamoDB tables is `TableV2`. It supports single-region tables as well as globally-replicated tables and provides newer, more expressive properties (billing helpers, replica management, encryption choices, and warm throughput).

```typescript
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';


// Single region TableV2 example (on-demand billing)
const table = new dynamodb.TableV2(this, 'UsersTable', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
  billing: dynamodb.Billing.onDemand(),
  encryption: dynamodb.TableEncryptionV2.dynamoOwnedKey(),
  pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  removalPolicy: RemovalPolicy.RETAIN,
  timeToLiveAttribute: 'ttl',
});

// Add a GSI with compound keys (up to 4 partition keys + 4 sort keys) (v2.226.0+)
table.addGlobalSecondaryIndex({
  indexName: 'index-1',
  partitionKeys: [{ name: 'gsi1-pk', type: dynamodb.AttributeType.STRING }, { name: 'gsi12-pk', type: dynamodb.AttributeType.NUMBER }],
  sortKeys: [{ name: 'gsi1-sk', type: dynamodb.AttributeType.STRING }, { name: 'gsi2-sk', type: dynamodb.AttributeType.NUMBER }],
  projectionType: dynamodb.ProjectionType.ALL,
});

// Advanced / Global table example with replicas and provisioned billing:
const globalTable = new dynamodb.TableV2(this, 'GlobalUsersTable', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
  billing: dynamodb.Billing.provisioned({
    readCapacity: dynamodb.Capacity.fixed(10),
    writeCapacity: dynamodb.Capacity.autoscaled({ maxCapacity: 50 }),
  }),
  replicas: [
    { region: 'us-east-1' },
    { region: 'us-east-2' },
  ],
  globalTableSettingsReplicationMode: dynamodb.GlobalTableSettingsReplicationMode.ALL,
  encryption: dynamodb.TableEncryptionV2.awsManagedKey(),
});

// per-replica adjustments
globalTable.addReplica({ region: 'eu-west-1', deletionProtection: true });
```

**TableGrants for Permission Management (v2.227.0+)**

Use `TableGrants` (via `table.grants`) for fine-grained permission management, ensuring least-privilege access to DynamoDB tables. Stream grants are available directly on the `TableV2` instance when the table is created with `dynamoStream` enabled.

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Grant read-only access to a Lambda function
const readOnlyGrant = table.grants.readData(lambdaFunction);

// Grant write-only access
const writeOnlyGrant = table.grants.writeData(lambdaFunction);

// Grant read-write access
const readWriteGrant = table.grants.readWriteData(lambdaFunction);

// Grant specific actions for fine-grained control
table.grants.actions(lambdaFunction, 
  'dynamodb:GetItem', 
  'dynamodb:Query'
);

// Stream grants — available directly on TableV2 when dynamoStream is configured
const tableWithStream = new dynamodb.TableV2(this, 'TableWithStream', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  dynamoStream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
});

// Grant stream read permissions (DescribeStream, GetRecords, GetShardIterator, ListStreams)
tableWithStream.grantStreamRead(streamConsumerFunction);

// Grant specific stream actions
tableWithStream.grantStream(streamConsumerFunction,
  'dynamodb:GetRecords',
  'dynamodb:GetShardIterator'
);

// List streams permissions only
tableWithStream.grantTableListStreams(streamConsumerFunction);
```

**New Props, Methods and ENUMs**

| New Construct | Comment |
|---------------|---------|
| `TableV2MultiAccountReplica` | Create DynamoDB replicas in other AWS accounts (v2.239.0+) |

| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `GlobalSecondaryIndexPropsV2` | `partitionKeys` | `Attribute[]` | Array of up to 4 partition key attributes for compound GSI keys (v2.226.0+) |
| `GlobalSecondaryIndexPropsV2` | `sortKeys` | `Attribute[]` | Array of up to 4 sort key attributes for compound GSI keys (v2.226.0+) |

| Construct | New Method | Comment |
|-----------|------------|---------|
| `TableGrants` | `readData()` | Grant `GetItem`, `Query`, `Scan`, `BatchGetItem`, `ConditionCheckItem`, `DescribeTable` |
| `TableGrants` | `writeData()` | Grant `PutItem`, `UpdateItem`, `DeleteItem`, `BatchWriteItem`, `ConditionCheckItem`, `DescribeTable` |
| `TableGrants` | `readWriteData()` | Grant combined read and write permissions |
| `TableGrants` | `actions()` | Grant specific DynamoDB actions |
| `TableV2` | `grantStreamRead()` | Grant stream read permissions when `dynamoStream` is configured (v2.227.0+) |
| `TableV2` | `grantStream()` | Grant specific stream actions when `dynamoStream` is configured (v2.227.0+) |
| `TableV2` | `grantTableListStreams()` | Grant `ListStreams` permission when `dynamoStream` is configured (v2.227.0+) |

**Cross-Account Global Table Replication (v2.239.0+)**

Set up DynamoDB global tables with cross-account replication for multi-account, multi-region applications. Use `TableV2MultiAccountReplica` to create replicas in other AWS accounts.

**In the source account:**

```typescript
// Create the primary table in the source account
const sourceTable = new dynamodb.TableV2(this, 'SourceTable', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
  billing: dynamodb.Billing.provisioned({
    readCapacity: dynamodb.Capacity.fixed(10),
    writeCapacity: dynamodb.Capacity.fixed(10),
  }),
  encryption: dynamodb.TableEncryptionV2.awsManagedKey(),
  removalPolicy: RemovalPolicy.RETAIN,
});

// Grant multi-account replication permissions to the destination account
sourceTable.grants.multiAccountReplicationTo(
  'arn:aws:dynamodb:us-west-2:987654321098:table/DestinationTable'
);
```

**In the destination account:**

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// Create a multi-account replica that replicates from the source table
const replicaTable = new dynamodb.TableV2MultiAccountReplica(this, 'ReplicaTable', {
  replicaSourceTable: sourceTableReference, // ITableV2 reference to the source table
  billing: dynamodb.Billing.provisioned({
    readCapacity: dynamodb.Capacity.fixed(10),
    writeCapacity: dynamodb.Capacity.fixed(10),
  }),
  encryption: dynamodb.TableEncryptionV2.awsManagedKey(),
  removalPolicy: RemovalPolicy.RETAIN,
});

// Grant replication permissions from the source account
replicaTable.grants.multiAccountReplicationFrom(
  'arn:aws:dynamodb:us-east-1:123456789012:table/SourceTable'
);
```

**Cross-Account Setup Pattern:**

```typescript
// Reference a table from another account for multi-account replication
const sourceTableArn = 'arn:aws:dynamodb:us-east-1:123456789012:table/SourceTable';
const sourceStreamArn = 'arn:aws:dynamodb:us-east-1:123456789012:table/SourceTable/stream/2024-01-01T00:00:00.000';

// In consumer account, create replica with reference
const replica = new dynamodb.TableV2MultiAccountReplica(this, 'MultiAccountReplica', {
  replicaSourceTable: dynamodb.TableV2.fromTableArn(this, 'SourceTableRef', sourceTableArn),
  pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
  billing: dynamodb.Billing.provisioned({
    readCapacity: dynamodb.Capacity.fixed(5),
    writeCapacity: dynamodb.Capacity.fixed(5),
  }),
  removalPolicy: RemovalPolicy.RETAIN,
});

// Configure IAM role for cross-account replication
const replicationRole = new iam.Role(this, 'ReplicationRole', {
  assumedBy: new iam.ServicePrincipal('dynamodb.amazonaws.com'),
});

// Add permissions for cross-account access
replicationRole.addToPrincipalPolicy(
  new iam.PolicyStatement({
    actions: [
      'dynamodb:DescribeTable',
      'dynamodb:DescribeStream',
      'dynamodb:GetRecords',
      'dynamodb:GetShardIterator',
      'dynamodb:ListStreams',
    ],
    resources: [sourceTableArn, sourceStreamArn],
  })
);
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `TableV2` | `contributorInsights` | Use `contributorInsightsSpecification` instead |
| `TableV2` | `pointInTimeRecovery` | Use `pointInTimeRecoverySpecification` instead |

| Construct | Deprecated Method | Comment |
|-----------|-------------------|---------|
| `TableV2` | `metricSystemErrors()` | Prefer operation-specific metric helpers `metricSystemErrorsForOperations()` |
| `TableV2` | `metricThrottledRequests()` | Do not use this function. It returns an invalid metric. Use `metricThrottledRequestsForOperation()` instead |

### EC2 VPC

```typescript
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const vpc = new ec2.Vpc(this, 'VPC', {
  ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
  maxAzs: 3,
  natGateways: 2,
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'public',
      subnetType: ec2.SubnetType.PUBLIC,
    },
    {
      cidrMask: 24,
      name: 'private-app',
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
    {
      cidrMask: 28,
      name: 'private-db',
      subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
    },
  ],
  gatewayEndpoints: {
    S3: {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    },
    DynamoDB: {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
    },
  },
});

// Add VPC Endpoints for AWS Services
vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
  service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
});
```

**VPC Flow Logs with Firehose Delivery Stream (v2.230.0+, 2025-07-18)**

VPC Flow Logs can now be delivered to Amazon Kinesis Data Firehose for real-time processing and archival to S3, data lakes, or analytics platforms.

```typescript
import * as kinesisfirehose from 'aws-cdk-lib/aws-kinesisfirehose';

// Create Firehose delivery stream for VPC Flow Logs
const firehoseStream = new kinesisfirehose.CfnDeliveryStream(this, 'VpcFlowLogsFirehose', {
  deliveryStreamType: 'DirectPut',
  extendedS3DestinationConfiguration: {
    roleArn: firehoseRole.roleArn,
    bucketArn: bucket.bucketArn,
    bufferingHints: {
      sizeInMBs: 128,
      intervalInSeconds: 60,
    },
    cloudWatchLoggingOptions: {
      enabled: true,
      logGroupName: logGroup.logGroupName,
      logStreamName: 'vpc-flow-logs',
    },
  },
});

// Add VPC Flow Logs with Firehose destination
vpc.addFlowLog('VpcFlowLogsFirehose', {
  destination: ec2.FlowLogDestination.toFirehose(firehoseStream),
  trafficType: ec2.FlowLogTrafficType.ALL,
});
```

**Note:** For cross-account delivery, you must specify an IAM role with appropriate permissions. Refer to [AWS documentation](https://docs.aws.amazon.com/vpc/latest/userguide/firehose-cross-account-delivery.html) for cross-account setup.

**New Props, Methods and ENUMs**
| Construct | Method | Comment |
|-----------|--------|---------|
| `FlowLogDestination` | `toFirehose()` | New destination type — pass a `CfnDeliveryStream` to send VPC flow logs to Kinesis Data Firehose (v2.230.0+) |

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `Vpc` | `cidr` | Deprecated: use `ipAddresses` (e.g., `IpAddresses.cidr(...)`) instead of the legacy `cidr` prop |

### ECS Fargate

```typescript
import { Duration } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

// ECS Cluster running Fargate
const cluster = new ecs.Cluster(this, 'Cluster', {
  vpc,
  clusterName: 'my-cluster',
  containerInsightsV2: ecs.ContainerInsights.ENHANCED,
});

// Create task definition
const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
  memoryLimitMiB: 2048,
  cpu: 1024,
  runtimePlatform: {
    cpuArchitecture: ecs.CpuArchitecture.ARM64,
    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
  },
});

// Add container
const container = taskDefinition.addContainer('app', {
  image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
  logging: ecs.LogDrivers.awsLogs({
    streamPrefix: 'app',
    logRetention: logs.RetentionDays.ONE_WEEK,
  }),
  environment: {
    NODE_ENV: 'production',
  },
  secrets: {
    DB_PASSWORD: ecs.Secret.fromSecretsManager(secret, 'password'),
  },
  healthCheck: {
    command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
    interval: Duration.seconds(30),
    timeout: Duration.seconds(5),
    retries: 3,
  },
});

container.addPortMappings({
  containerPort: 80,
  protocol: ecs.Protocol.TCP,
});

// Create the Fargate Service

const fargateSG = new ec2.SecurityGroup(this, "FargateSecurityGroup", {
  vpc,
});

const fargateService = new ecs.FargateService(this, 'Service', {
  cluster,
  taskDefinition,
  serviceName: 'MyFargateService',
  desiredCount: 2,
  minHealthyPercent: 50,
  maxHealthyPercent: 200,
  securityGroups: [fargateSG]
});

// Add ALB
const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
  vpc,
  internetFacing: true,
});

const listener = lb.addListener('Listener', {
  port: 443,
  certificates: [certificate],
});

listener.addTargets('ECS', {
  port: 80,
  targets: [fargateService],
  healthCheck: {
    path: '/health',
    interval: Duration.seconds(30),
  },
});
```

**Linear and Canary Deployments (v2.230.0+, 2025-07-18)**

ECS now supports built-in Linear and Canary deployment strategies for controlled and progressive rollouts. Configure deployment strategies at the service level to gradually update task definitions.

```typescript
// Linear deployment: gradually replace tasks at a fixed percentage interval
const linearService = new ecs.FargateService(this, 'LinearService', {
  cluster,
  taskDefinition,
  desiredCount: 10,
  deploymentStrategy: ecs.DeploymentStrategy.LINEAR,
  linearConfiguration: {
    stepPercent: 25,          // Replace 25% of tasks each step
    stepBakeTime: Duration.minutes(1),  // Wait 1 minute between steps
  },
});

// Canary deployment: test with a small percentage before full rollout
const canaryService = new ecs.FargateService(this, 'CanaryService', {
  cluster,
  taskDefinition,
  desiredCount: 10,
  deploymentStrategy: ecs.DeploymentStrategy.CANARY,
  canaryConfiguration: {
    stepPercent: 10,          // Start with 10% of tasks
    stepBakeTime: Duration.minutes(5),  // Bake for 5 minutes before full rollout
  },
});
```

**Spot Capacity Provider (v2.230.0+, 2025-07-18)**

Use Spot instances through Managed Instances Capacity Providers to reduce costs while maintaining service availability.

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';

const infrastructureRole = new iam.Role(this, 'InfrastructureRole', {
  assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
  ],
});

const instanceRole = new iam.Role(this, 'InstanceRole', {
  assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
  ],
});

const instanceProfile = new iam.InstanceProfile(this, 'InstanceProfile', {
  role: instanceRole,
});

const securityGroup = new ec2.SecurityGroup(this, 'SpotSG', {
  vpc,
  description: 'Security group for Spot capacity provider instances',
});

// Create Spot capacity provider (securityGroups is required)
const spotCapacityProvider = new ecs.ManagedInstancesCapacityProvider(this, 'SpotProvider', {
  infrastructureRole: infrastructureRole,
  ec2InstanceProfile: instanceProfile,
  subnets: vpc.privateSubnets,
  securityGroups: [securityGroup],
  capacityOptionType: ecs.CapacityOptionType.SPOT,  // Use Spot instances
});

cluster.addManagedInstancesCapacityProvider(spotCapacityProvider);
```

**New Props, Methods and ENUMs**
| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `FargateService` | `deploymentStrategy` | `DeploymentStrategy.LINEAR` | Gradually replace tasks at a fixed percentage per step (v2.230.0+) |
| `FargateService` | `deploymentStrategy` | `DeploymentStrategy.CANARY` | Test with a small percentage before full rollout (v2.230.0+) |
| `FargateService` | `linearConfiguration` | `{ stepPercent, stepBakeTime }` | Required when `deploymentStrategy` is `LINEAR` |
| `FargateService` | `canaryConfiguration` | `{ stepPercent, stepBakeTime }` | Required when `deploymentStrategy` is `CANARY` |
| `ManagedInstancesCapacityProvider` | `capacityOptionType` | `CapacityOptionType.ON_DEMAND` | Use On-Demand instances (default) (v2.230.0+) |
| `ManagedInstancesCapacityProvider` | `capacityOptionType` | `CapacityOptionType.SPOT` | Use Spot instances for cost savings (v2.230.0+) |

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `Cluster` | `containerInsights` | Use `containerInsightsV2` instead |

| Construct | Deprecated Method | Comment |
|-----------|-------------------|---------|
| `FargateTaskDefinition` | `addInferenceAccelerator()` | ECS TaskDefinition's inferenceAccelerator is EOL since April 2024 |

### IAM Policy & Role

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';

const managedPolicy = new iam.ManagedPolicy(this, 'AppManagedPolicy', {
  managedPolicyName: 'myapp-dynamodb-read-policy',
  statements: [
    new iam.PolicyStatement({
      actions: ['dynamodb:Query', 'dynamodb:GetItem'],
      resources: ['arn:aws:dynamodb:us-east-1:123456789012:table/my-table'],
    }),
  ],
});

const role = new iam.Role(this, 'ServiceRole', {
  roleName: 'myapp-lambda-role',
  description: 'Example role for my app Lambda Function',
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [managedPolicy],
});
```

### Lambda Function and Layer

```typescript
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

const powertoolsLayer = new lambda.LayerVersion(this, 'PowertoolsLayer', {
  code: lambda.Code.fromAsset('lambda/layers/powertools'),
  compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
  description: 'AWS Lambda Powertools',
});

const lambdaLogGroup = new logs.LogGroup(this, 'LambdaHandlerLogGroup', {
  retention: logs.RetentionDays.ONE_WEEK,
  removalPolicy: RemovalPolicy.DESTROY,
});

const listFn = new lambda.Function(this, 'ApiHandler', {
  functionName: 'myapp-list-orders',
  runtime: lambda.Runtime.PYTHON_3_12,
  handler: 'main.lambda_handler',
  code: lambda.Code.fromAsset('lambda/functions/api'),
  timeout: Duration.seconds(30),
  memorySize: 512,
  layers: [powertoolsLayer],
  environment: {
    POWERTOOLS_SERVICE_NAME: 'api',
    POWERTOOLS_METRICS_NAMESPACE: 'MyApp',
    LOG_LEVEL: 'INFO',
    TABLE_NAME: table.tableName,
  },
  logGroup: lambdaLogGroup,
  tracing: lambda.Tracing.ACTIVE,
  reservedConcurrentExecutions: 10,
  architecture: lambda.Architecture.ARM_64,
});

// Grant DynamoDB permissions
table.grantReadWriteData(listFn);
```

**Capacity Providers (v2.230.0+, 2025-07-18)**

Lambda Capacity Providers manage a pool of EC2 instances for Lambda functions, enabling predictable performance and cost control. Create a `CapacityProvider` with VPC subnets and security groups, then associate Lambda functions via `addFunction()`.

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

const capacityProvider = new lambda.CapacityProvider(this, 'MyCapacityProvider', {
  subnets: vpc.privateSubnets,       // required: at least one subnet
  securityGroups: [securityGroup],   // required: at least one security group
  // optional:
  // maxVCpuCount: 400,
  // scalingOptions: lambda.ScalingOptions.manual([...]),
});

const fn = new lambda.Function(this, 'MyFunction', {
  runtime: lambda.Runtime.NODEJS_22_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
});

// Associate the function with the capacity provider
capacityProvider.addFunction(fn);
```

**Durable Functions (v2.230.0+, 2025-07-18)**

Durable Functions allow Lambda to maintain execution state across long-running operations using checkpointing. Use the `durableConfig` property to enable durable execution. The function's execution role is automatically updated to use `AWSLambdaBasicDurableExecutionRolePolicy`.

```typescript
import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const durableFunction = new lambda.Function(this, 'DurableFunction', {
  runtime: lambda.Runtime.NODEJS_22_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
  durableConfig: {
    executionTimeout: Duration.hours(1),  // max execution time including checkpoints
    retentionPeriod: Duration.days(30),   // how long to retain execution state
  },
});
```

**New Props, Methods and ENUMs**

| New Construct | Comment |
|---------------|---------|
| `CapacityProvider` | Manages a pool of EC2 instances for Lambda. Requires `subnets` and `securityGroups` (v2.230.0+) |

| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `Function` | `durableConfig` | `{ executionTimeout, retentionPeriod }` | Enables durable execution with checkpointing. Automatically uses `AWSLambdaBasicDurableExecutionRolePolicy` (v2.230.0+) |

| Construct | New Method | Comment |
|-----------|------------|---------|
| `CapacityProvider` | `addFunction()` | Associates a Lambda function with this capacity provider |

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `Function` | `applicationLogLevel` | Deprecated in favor of `applicationLogLevelV2` or centralized logging configuration |
| `Function` | `logFormat` | Use `loggingFormat` or configure an explicit `LogGroup` instead of the legacy `logFormat` property |
| `Function` | `logRemovalPolicy` | Inline log removal policy on `Function` is deprecated. Create and manage `LogGroup` explicitly instead |
| `Function` | `logRetention` | Inline log retention props on `Function` is deprecated. Create and manage `LogGroup` explicitly instead |
| `Function` | `systemLogLevel` | Deprecated in favor of `systemLogLevelV2` |

### S3 Buckets

```typescript
import { RemovalPolicy, Duration } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-unique-bucket-name',
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.RETAIN,
  lifecycleRules: [
    {
      id: 'DeleteOldVersions',
      noncurrentVersionExpiration: Duration.days(90),
      enabled: true,
    },
    {
      id: 'TransitionToIA',
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: Duration.days(30),
        },
      ],
      enabled: true,
    },
  ],
  cors: [
    {
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
      allowedOrigins: ['https://example.com'],
      allowedHeaders: ['*'],
      maxAge: 3000,
    },
  ],
});

// Grant read access to a Lambda function
bucket.grantReadWrite(processFn);
```

**Attribute-Based Access Control (v2.230.0+, 2025-07-18)**

Enable Attribute-Based Access Control (ABAC) on S3 buckets to support fine-grained permission management using resource tags. Set `abacStatus: true` to activate ABAC for the bucket.

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const abacBucket = new s3.Bucket(this, 'AbacBucket', {
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
  abacStatus: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.RETAIN,
});
```

**BucketGrants (v2.230.0+, 2025-07-18)**

The `BucketGrants` class provides fine-grained permission management for S3 buckets. Access grant methods through the `bucket.grants` property. These mirror the existing `bucket.grant*()` methods but are grouped under a dedicated class.

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// Grant read-only access (s3:GetObject, s3:GetBucket*, s3:List*)
bucket.grants.read(lambdaFunction);

// Grant write access (s3:PutObject, s3:Abort*, s3:DeleteObject*)
bucket.grants.write(lambdaFunction, 'uploads/*');  // optional key pattern

// Grant read-write access
bucket.grants.readWrite(lambdaFunction);

// Grant delete access (s3:DeleteObject*)
bucket.grants.delete(lambdaFunction, 'temp/*');  // optional key pattern

// Grant put object permissions (s3:PutObject, s3:Abort*)
bucket.grants.put(lambdaFunction);

// Grant public read access — only valid when blockPublicAccess is NOT set to BLOCK_ALL
bucket.grants.publicAccess('public/*', 's3:GetObject');
```

**New Props, Methods and ENUMs**
| Construct | Prop | Value | Comment |
|-----------|------|-------|---------|
| `BucketProps` | `abacStatus` | `true` / `false` | Enables Attribute-Based Access Control using resource tags (v2.230.0+) |

| Construct | New Method | Comment |
|-----------|------------|---------|
| `BucketGrants` | `read()` | Grant `s3:GetObject`, `s3:GetBucket*`, `s3:List*` (v2.230.0+) |
| `BucketGrants` | `write()` | Grant `s3:PutObject`, `s3:Abort*`, `s3:DeleteObject*` (v2.230.0+) |
| `BucketGrants` | `readWrite()` | Grant combined read and write permissions (v2.230.0+) |
| `BucketGrants` | `delete()` | Grant `s3:DeleteObject*` (v2.230.0+) |
| `BucketGrants` | `put()` | Grant `s3:PutObject`, `s3:Abort*` (v2.230.0+) |
| `BucketGrants` | `publicAccess()` | Grant public read — throws if `blockPublicAccess` is set (v2.230.0+) |
| `BucketGrants` | `replicationPermission()` | Grant replication permissions for source and destination buckets (v2.230.0+) |

### RDS Database Cluster

```typescript
import { Duration } from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';

const vpc = new ec2.Vpc(this, 'VPC', { maxAzs: 3 });

const key = new kms.Key(this, 'DBKey', {
  enableKeyRotation: true,
  rotationPeriod: Duration.days(180),
});

// By default the master password will be generated and stored in AWS Secrets Manager.
// Use `fromGeneratedSecret()` to have CDK create the secret with a given username.
const dbCluster = new rds.DatabaseCluster(this, 'Database', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_17_7,
  }),
  credentials: rds.Credentials.fromGeneratedSecret('syscdk'),
  writer: rds.ClusterInstance.provisioned('writer', {
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
    publiclyAccessible: false,
  }),
  readers: [
    rds.ClusterInstance.provisioned('reader1', { instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM) }),
  ],
  storageEncrypted: true,
  storageEncryptionKey: key,
  vpc,
  deletionProtection: true,
});

// Optionally Grant access to compute like Fargate
dbCluster.connections.allowFrom(fargateSG, ec2.Port.tcp(5432));
```

**CloudWatch Log Exports (v2.230.0+, 2025-07-18)**

Enable CloudWatch log exports for RDS instances to monitor database activity. Use the `cloudwatchLogsExports` property to specify which log types to export. For `DatabaseInstance`, valid values include `instance` and `iam-db-auth-error` (in addition to engine-specific options).

```typescript
import * as rds from 'aws-cdk-lib/aws-rds';

// DatabaseInstance with CloudWatch log exports
const dbInstance = new rds.DatabaseInstance(this, 'Database', {
  engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_17_7 }),
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
  credentials: rds.Credentials.fromGeneratedSecret('admin'),
  vpc,
  cloudwatchLogsExports: ['instance', 'iam-db-auth-error'],
});
```

**Default Auth Scheme for RDS Proxy (v2.230.0+, 2025-07-18)**

RDS Database Proxy now supports configuring a default IAM authentication scheme without requiring a Secrets Manager secret. When `defaultAuthScheme` is set to `DefaultAuthScheme.IAM_AUTH`, the `secrets` property is optional.

```typescript
import * as rds from 'aws-cdk-lib/aws-rds';

// Create RDS Proxy with IAM authentication — no secrets required
const proxy = new rds.DatabaseProxy(this, 'Proxy', {
  proxyTarget: rds.ProxyTarget.fromCluster(dbCluster),
  vpc,
  defaultAuthScheme: rds.DefaultAuthScheme.IAM_AUTH,
  iamAuth: true,
});

// Grant IAM connect permission to a role or function
proxy.grantConnect(lambdaFunction, 'database-user');
```

**New Props, Methods and ENUMs**
| Construct | Prop | Value | Comment |
|-----------|--------------|---------|
| `DatabaseProxyProps` | `defaultAuthScheme` | `DefaultAuthScheme.IAM_AUTH` | Use end-to-end IAM authentication. Makes `secrets` optional (v2.230.0+) |
| `DatabaseProxyProps` | `defaultAuthScheme` | `DefaultAuthScheme.NONE` | Default — uses Secrets Manager credentials |
| `DatabaseInstance` | `cloudwatchLogsExports` | `'instance'` | New log type: exports instance-level logs (v2.230.0+) |
| `DatabaseInstance` | `cloudwatchLogsExports` | `'iam-db-auth-error'` | New log type: exports IAM DB authentication errors (v2.230.0+) |

| Construct | New Method | Comment |
|-----------|------------|---------|
| `DatabaseCluster` | `metricVolumeReadIOPs()` | Cluster-level volume read IOPS CloudWatch metric (v2.230.0+) |
| `DatabaseCluster` | `metricVolumeWriteIOPs()` | Cluster-level volume write IOPS CloudWatch metric (v2.230.0+) |
| `DatabaseInstance` | `metricReadIOPS()` | Instance-level read IOPS CloudWatch metric (v2.230.0+) |
| `DatabaseInstance` | `metricWriteIOPS()` | Instance-level write IOPS CloudWatch metric (v2.230.0+) |

**Read/Write IOPS Metrics (v2.230.0+, 2025-07-18)**

Access CloudWatch metrics for RDS read and write IOPS at both cluster and instance levels. Use `metricVolumeReadIOPs()` / `metricVolumeWriteIOPs()` for clusters and `metricReadIOPS()` / `metricWriteIOPS()` for instances.

```typescript
import * as rds from 'aws-cdk-lib/aws-rds';
import { Duration } from 'aws-cdk-lib';

// Cluster-level IOPS metrics
const clusterReadIops = dbCluster.metricVolumeReadIOPs({
  period: Duration.minutes(5),
  statistic: 'Average',
});

const clusterWriteIops = dbCluster.metricVolumeWriteIOPs({
  period: Duration.minutes(5),
  statistic: 'Average',
});

// Instance-level IOPS metrics
const instanceReadIops = dbInstance.metricReadIOPS({
  period: Duration.minutes(5),
  statistic: 'Average',
});

const instanceWriteIops = dbInstance.metricWriteIOPS({
  period: Duration.minutes(5),
  statistic: 'Average',
});
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `DatabaseCluster` | `clusterScalabilityType` | Deprecated: prefer the newer `clusterScalabilityType` or the updated writer/readers configuration |
| `DatabaseCluster` | `instances` | Deprecated in favor of `writer`/`readers` properties and instance-specific configuration objects |
| `DatabaseCluster` | `instanceProps` | Deprecated in favor of `writer`/`readers` properties and instance-specific configuration objects |

### Secrets Manager

```typescript
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

// Create secret
const dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
  secretName: 'myapp/db/credentials',
  description: 'Database credentials',
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: 'admin' }),
    generateStringKey: 'password',
    excludePunctuation: true,
    passwordLength: 32,
  },
});

// Grant Lambda read access
dbSecret.grantRead(listFn);
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `Secret` | `secretStringBeta1` | Use `secretStringValue` instead. NOTE: *It is highly encouraged to leave `secretStringValue` undefined and allow SecretsManager to create the secret value. The secret string -- if provided -- will be included in the output of the cdk as part of synthesis, and will appear in the CloudFormation template in the console |

### SSM Parameter

```typescript
import * as ssm from 'aws-cdk-lib/aws-ssm';

new ssm.StringParameter(this, 'MyParam', {
  parameterName: '/myapp/config/featureFlag',
  stringValue: 'enabled',
});
```

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `StringParameter` | `type` | Deprecated: the `type` will always be `String`. Use typed lookup APIs or SecretsManager for secrets |

| Construct | Deprecated Method | Comment |
|-----------|-------------------|---------|
| `StringParameter` | `valueForSecureStringParameter()` | Deprecated: use `SecretValue.ssmSecure()` or Secrets Manager instead for secure values |
| `StringParameter` | `valueForTypedStringParameter()` | Deprecated: use the v2 typed lookup APIs (e.g., `valueForTypedStringParameterV2()`) or explicit runtime configuration |

### Step Functions State Machine

```typescript
import { Duration } from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Three example Lambda functions used by the state machine
const invokeAction1Fn = new lambda.Function(this, 'Action1Fn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/action1'),
});

const invokeCheckStatusFn = new lambda.Function(this, 'CheckStatusFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/checkStatus'),
});

const invokeAction2Fn = new lambda.Function(this, 'Action2Fn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda/action2'),
});

// Terminal states
const failState = new sfn.Fail(this, 'Failed', {
  cause: 'LambdaFailed',
  error: 'FunctionError',
});

const succeedState = new sfn.Succeed(this, 'Succeeded');

// Tasks that invoke the Lambdas. `outputPath: '$.Payload'` extracts the Lambda
// response for downstream evaluation (for example { status: 'success' }).
const invokeAction1 = new tasks.LambdaInvoke(this, 'Invoke Action 1', {
  lambdaFunction: invokeAction1Fn,
  outputPath: '$.Payload',
}).addCatch(failState, { resultPath: '$.error' });

const checkStatus = new tasks.LambdaInvoke(this, 'Check Status', {
  lambdaFunction: invokeCheckStatusFn,
  outputPath: '$.Payload',
}).addCatch(failState, { resultPath: '$.error' });

const invokeAction2 = new tasks.LambdaInvoke(this, 'Invoke Action 2', {
  lambdaFunction: invokeAction2Fn,
  outputPath: '$.Payload',
}).addCatch(failState, { resultPath: '$.error' });

// Polling wait
const wait = new sfn.Wait(this, 'Wait 30s', {
  time: sfn.WaitTime.duration(Duration.seconds(30)),
});

// Choice state: if checkStatus returns { status: 'success' } -> proceed,
// otherwise wait and loop back to action 1.
const isSuccess = new sfn.Choice(this, 'IsStatusSuccess?');
isSuccess.when(sfn.Condition.stringEquals('$.status', 'success'), invokeAction2.next(succeedState));
isSuccess.otherwise(wait.next(invokeAction1));

// Definition: action1 -> check -> choice
const definition = invokeAction1.next(checkStatus).next(isSuccess);

new sfn.StateMachine(this, 'StateMachineWithLambda', {
  definitionBody: sfn.DefinitionBody.fromChainable(definition),
  timeout: Duration.minutes(10),
});
```

**JSONata Expressions in Map.ItemSelector (v2.230.0+, 2025-07-18)**

The `Map` state now supports JSONata expressions for `ItemSelector` through the `jsonataItemSelector` property (a string). This is mutually exclusive with `itemSelector` (object). Set `queryLanguage: QueryLanguage.JSONATA` on the Map state to enable JSONata mode.

```typescript
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

// Map state with JSONata ItemSelector
const mapState = new sfn.Map(this, 'ProcessItems', {
  maxConcurrency: 5,
  queryLanguage: sfn.QueryLanguage.JSONATA,
  // jsonataItemSelector is a string — mutually exclusive with itemSelector
  jsonataItemSelector: '{% {"id": $states.input.id, "value": $states.input.value} %}',
});

mapState.itemProcessor(new sfn.Pass(this, 'ProcessItem'), {
  mode: sfn.ProcessorMode.INLINE,
});

new sfn.StateMachine(this, 'StateMachineWithJsonata', {
  definitionBody: sfn.DefinitionBody.fromChainable(mapState),
});
```

**StateMachineGrants (v2.230.0+, 2025-07-18)**

Use `StateMachineGrants` for fine-grained permission management on Step Functions state machines. Access grant methods through the `stateMachine.grants` property. These delegate to the same underlying IAM grants as the existing `stateMachine.grant*()` methods.

```typescript
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

// Grant specific permissions using StateMachineGrants
stateMachine.grants.startExecution(lambdaFunction);
stateMachine.grants.startSyncExecution(lambdaFunction);
stateMachine.grants.read(lambdaFunction);
stateMachine.grants.taskResponse(lambdaFunction);
stateMachine.grants.redriveExecution(lambdaFunction);
stateMachine.grants.execution(lambdaFunction, 'states:DescribeExecution');
stateMachine.grants.actions(lambdaFunction, 'states:StartExecution', 'states:StopExecution');
```


| Construct | Prop / Method / ENUM | New Value | Comment |
|-----------|----------------------|-----------|---------|
| `Map` | `jsonataItemSelector` | `string` | JSONata expression string for `ItemSelector`. Mutually exclusive with `itemSelector`. Requires `queryLanguage: QueryLanguage.JSONATA` (v2.230.0+) |
| `Map` | `queryLanguage` | `QueryLanguage.JSONATA` | Enable JSONata query language for the Map state |
| `StateMachineGrants` | `startExecution()` | Grant `states:StartExecution` (v2.230.0+) |
| `StateMachineGrants` | `startSyncExecution()` | Grant `states:StartSyncExecution` (v2.230.0+) |
| `StateMachineGrants` | `read()` | Grant `states:ListExecutions`, `states:DescribeExecution`, `states:GetExecutionHistory`, etc. (v2.230.0+) |
| `StateMachineGrants` | `taskResponse()` | Grant `states:SendTaskSuccess`, `states:SendTaskFailure`, `states:SendTaskHeartbeat` (v2.230.0+) |
| `StateMachineGrants` | `redriveExecution()` | Grant `states:RedriveExecution` (v2.230.0+) |
| `StateMachineGrants` | `execution()` | Grant custom actions on execution ARNs (v2.230.0+) |
| `StateMachineGrants` | `actions()` | Grant custom actions on the state machine ARN (v2.230.0+) |

**Deprecated Props and Methods**
| Construct | Deprecated Prop | Comment |
|-----------|-----------------|---------|
| `StateMachine` | `definition` | Use `definitionBody: DefinitionBody.fromChainable()` instead |
| `DistributedMap` | `resultWriter` | Use `resultWriterV2` instead | 
| `Map` | `parameters` | Step Functions has deprecated the `parameters` field in favor of the new `itemSelector` field |
| `LambdaInvoke` | `heartbeat` | Use `heartbeatTimeout` instead |
| `LambdaInvoke` | `qualifier` | Pass a Version or Alias object as `lambdaFunction` instead |
| `LambdaInvoke` | `timeout` | Use `taskTimeout` instead |

## Security Best Practices

### Least Privilege IAM Policies

```typescript
// ❌ BAD: Overly permissive
lambdaFn.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['s3:*'],
    resources: ['*'],
  })
);

// ✅ GOOD: Specific actions and resources
lambdaFn.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['s3:GetObject', 's3:PutObject'],
    resources: [bucket.arnForObjects('*')],
  })
);
```

### IAM Roles with Permission Boundaries

Permission boundaries define the maximum permissions that IAM roles and users can have, regardless of the identity-based policies attached to them. They are critical for preventing privilege escalation.

A permission boundary policy typically contains:
- **Base anti-escalation statements** (DENY): prevent modifying the boundary itself, removing boundaries, or creating roles/users without the boundary attached.
- **Allowed actions** (ALLOW): the maximum set of permissions any role in the application can have.
- **Organization-specific guardrails** (DENY): deny specific actions the organization restricts (e.g., VPC modifications, direct IAM changes).

**Create Permission Boundary Example:**

Always adapt the permission boundary following least privilege principles based on the needs of the project and change IAM role and policy resource names based on the project naming pattern.

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';

const appName = 'myapp';
const permissionBoundaryName = `${appName}-permission-boundary`;

const permissionBoundary = new iam.ManagedPolicy(this, 'PermissionBoundary', {
  managedPolicyName: permissionBoundaryName,
  statements: [
    // --- Base permissions ---
    // Allow all actions except sensitive services
    new iam.PolicyStatement({
      sid: 'BaseAccess',
      effect: iam.Effect.ALLOW,
      notActions: [
        'iam:*',
        'organizations:*',
        'account:*',
        'billing:*',
        'budgets:*',
      ],
      resources: ['*'],
    }),

    // Allow limited, read-only IAM actions
    new iam.PolicyStatement({
      sid: 'LimitedIamActions',
      effect: iam.Effect.ALLOW,
      actions: [
        'iam:CreateServiceLinkedRole',
        'iam:DeleteServiceLinkedRole',
        'iam:Get*',
        'iam:List*',
        'iam:Generate*',
        'iam:Tag*',
        'iam:Untag*',
        'organizations:DescribeOrganization',
        'account:ListRegions',
      ],
      resources: ['*'],
    }),

    // Allow PassRole only to specific services and scoped to app roles
    new iam.PolicyStatement({
      sid: 'AllowPassRoleToRequiredServices',
      effect: iam.Effect.ALLOW,
      actions: ['iam:PassRole'],
      resources: [`arn:aws:iam::${this.account}:role/${appName}-*`],
      conditions: {
        StringEquals: {
          'iam:PassedToService': [
            // List only the services used in the project
            'lambda.amazonaws.com',
            'ecs-tasks.amazonaws.com',
          ],
        },
      },
    }),

    // Allow creating/modifying roles and users ONLY if the boundary is attached
    new iam.PolicyStatement({
      sid: 'AllowModifyIamWithBoundary',
      effect: iam.Effect.ALLOW,
      actions: [
        'iam:AttachRolePolicy',
        'iam:CreateRole',
        'iam:CreateUser',
        'iam:DeleteRolePolicy',
        'iam:DetachRolePolicy',
        'iam:PutRolePermissionsBoundary',
        'iam:PutRolePolicy',
        'iam:PutUserPermissionsBoundary',
      ],
      resources: [`arn:aws:iam::${this.account}:role/${appName}-*`],
      conditions: {
        StringEquals: {
          'iam:PermissionsBoundary': `arn:aws:iam::${this.account}:policy/${permissionBoundaryName}`,
        },
      },
    }),

    // Allow non-policy role modifications scoped to app roles
    new iam.PolicyStatement({
      sid: 'AllowModifyAppRoles',
      effect: iam.Effect.ALLOW,
      actions: [
        'iam:DeleteRole',
        'iam:UpdateAssumeRolePolicy',
        'iam:UpdateRole',
        'iam:UpdateRoleDescription',
      ],
      resources: [`arn:aws:iam::${this.account}:role/${appName}-*`],
    }),

    // --- Anti-escalation guardrails (DENY) ---
    // Prevent modification of the permission boundary policy itself
    new iam.PolicyStatement({
      sid: 'DenyBoundaryModification',
      effect: iam.Effect.DENY,
      actions: [
        'iam:CreatePolicyVersion',
        'iam:DeletePolicy',
        'iam:DeletePolicyVersion',
        'iam:SetDefaultPolicyVersion',
      ],
      resources: [`arn:aws:iam::${this.account}:policy/${permissionBoundaryName}`],
    }),

    // Prevent removal of permission boundaries from any role or user
    new iam.PolicyStatement({
      sid: 'DenyBoundaryRemoval',
      effect: iam.Effect.DENY,
      actions: [
        'iam:DeleteRolePermissionsBoundary',
        'iam:DeleteUserPermissionsBoundary',
      ],
      resources: ['*'],
    }),
  ],
});
```

#### How to Create and Apply Permission Boundaries

There are two common patterns for creating and applying permission boundaries in CDK. Select the pattern that fits the project's requirements.

**Pattern 1: External creation with `cdk.json` context (recommended for enforcement)**

When the permission boundary is created outside the CDK application (e.g., during `cdk bootstrap --custom-permissions-boundary <name>`, by a platform team, or in a separate governance stack), reference it by name in `cdk.json`. CDK will automatically attach it to every IAM Role and User created in the application:

```json
{
  "context": {
    "@aws-cdk/core:permissionsBoundary": {
      "name": "myapp-permission-boundary"
    }
  }
}
```

For multi-environment setups, apply different boundaries per Stage:

```typescript
import { App, Stage, PermissionsBoundary } from 'aws-cdk-lib';

const app = new App();

// Dev: no boundary (elevated privileges)
new Stage(app, 'DevStage');

// Prod: strict boundary
new Stage(app, 'ProdStage', {
  permissionsBoundary: PermissionsBoundary.fromName('prod-permission-boundary'),
});
```

This is the recommended pattern when the boundary must exist before deployment (e.g., when the CFN Execution Role itself is constrained to require boundaries on all new roles).

**Pattern 2: In-stack creation with `PermissionsBoundary.of().apply()` (for application-level boundaries)**

When the permission boundary is defined as part of the application's infrastructure-as-code, create it in the stack and apply it programmatically. Use this pattern when the boundary is managed within the application codebase:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const permissionBoundary = new iam.ManagedPolicy(this, 'PermissionBoundary', {
      managedPolicyName: 'myapp-permission-boundary',
      statements: [
        // ... (statements as in the example above)
      ],
    });

    // Apply to ALL IAM Roles and Users in this stack (including auto-created ones)
    iam.PermissionsBoundary.of(this).apply(permissionBoundary);

    // All roles created after this point will have the boundary attached.
    // For example, this Lambda's auto-created execution role will get the boundary:
    // new lambda.Function(this, 'Fn', { ... });
  }
}
```

With this pattern, the boundary policy and the roles it constrains are created in the same CloudFormation deployment. This works because CloudFormation resolves the dependency order automatically. However, if the CFN Execution Role requires boundaries to already exist before deployment, use Pattern 1 instead.

## Testing

### Unit Tests with Assertions

```typescript
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MyStack } from '../lib/my-stack';

describe('MyStack', () => {
  test('creates S3 bucket with encryption', () => {
    const app = new App();
    const stack = new MyStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    // Assert bucket exists
    template.resourceCountIs('AWS::S3::Bucket', 1);

    // Assert encryption is enabled
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('Lambda has correct environment variables', () => {
    const app = new App();
    const stack = new MyStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.objectLike({
          TABLE_NAME: Match.anyValue(),
        }),
      },
    });
  });
});
```

### Snapshot Tests

```typescript
test('stack matches snapshot', () => {
  const app = new App();
  const stack = new MyStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  expect(template.toJSON()).toMatchSnapshot();
});
```

## Deployment

### Bootstrap Environment

```bash
# Bootstrap default account/region
cdk bootstrap

# Bootstrap specific account/region
cdk bootstrap aws://123456789012/us-east-1

# Bootstrap with custom toolkit stack name
cdk bootstrap --toolkit-stack-name CustomCDKToolkit
```

### Synthesize CloudFormation

```bash
# Synth all stacks
cdk synth

# Synth specific stack
cdk synth MyStack

# Output to file
cdk synth MyStack > template.yaml
```

### Preview Changes

```bash
# Diff all stacks
cdk diff

# Diff specific stack
cdk diff MyStack
```

### Deploy

```bash
# Deploy all stacks
cdk deploy --all

# Deploy specific stack
cdk deploy MyStack

# Deploy without prompts (CI/CD)
cdk deploy --require-approval never

# Deploy with parameters
cdk deploy MyStack --parameters MyParameter=value
```

### Destroy

```bash
# Destroy all stacks
cdk destroy --all

# Destroy specific stack
cdk destroy MyStack

# Force destroy without prompts
cdk destroy --force
```

## Advanced Patterns

### Custom Constructs

```typescript
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface ApiLambdaProps {
  readonly tableName: string;
  readonly timeout?: Duration;
}

export class ApiLambda extends Construct {
  public readonly function: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ApiLambdaProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.function = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
      timeout: props.timeout || Duration.seconds(30),
    });

    this.table.grantReadWriteData(this.function);
  }
}

// Usage
new ApiLambda(this, 'MyApi', {
  tableName: 'my-table',
  timeout: Duration.seconds(60),
});
```

## Troubleshooting

### Common Issues

**Issue: Bootstrap errors**
```bash
# Solution: Re-bootstrap with latest CLI
cdk bootstrap --force
```

**Issue: Deploy fails with "No updates to perform"**
```bash
# Solution: Force synth and redeploy
rm -rf cdk.out
cdk synth
cdk deploy
```

**Issue: Permission errors during deployment**
```bash
# Solution: Check AWS credentials
aws sts get-caller-identity

# Verify IAM permissions include:
# - cloudformation:*
# - s3:* (for CDK toolkit bucket)
# - iam:PassRole
```

### Debug Mode

```bash
# Verbose output
cdk deploy --verbose

# Debug logging
CDK_DEBUG=true cdk deploy
```

## Best Practices Checklist

- ✅ Use CDK v2 (`aws-cdk-lib`)
- ✅ Pin exact dependency versions
- ✅ Use L2/L3 constructs over L1 CFN resources
- ✅ Tag all resources consistently
- ✅ Enable encryption at rest and in transit
- ✅ Use SSM Parameters for cross-stack references
- ✅ Write unit tests for infrastructure code
- ✅ Run `cdk diff` before deploying
- ✅ Use removal policies for stateful resources
- ✅ Enable CloudWatch logging and tracing
- ✅ Follow least privilege for IAM policies

## Reference Links

- **Official CDK Guide:** https://docs.aws.amazon.com/cdk/v2/guide/home.html
- **AWS Construct Library Reference:** https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html
- **AWS Prescriptive Guidance - The AWS CDK layer guide:** https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-cdk-layers/best-practices.html
- **Community Constructs:** https://constructs.dev/
- **CDK Patterns:** https://cdkpatterns.com/patterns/
