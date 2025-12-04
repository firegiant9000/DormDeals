import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Message Page (Buyer-Seller Communication)
 */
export class MessagePage {
  readonly page: Page;
  readonly chatList: Locator;
  readonly chatItems: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly messagesContainer: Locator;
  readonly messageBubbles: Locator;
  readonly itemInfo: Locator;
  readonly backButton: Locator;
  readonly newChatButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatList = page.locator('.chat-list, [data-testid="chat-list"]');
    this.chatItems = page.locator('.chat-item, [data-testid="chat-item"]');
    this.messageInput = page.locator('textarea[placeholder*="message" i], input[placeholder*="message" i], [data-testid="message-input"]');
    this.sendButton = page.locator('button:has-text("Send"), button[type="submit"]:near(textarea), [data-testid="send-button"]');
    this.messagesContainer = page.locator('.messages, .chat-messages, [data-testid="messages-container"]');
    this.messageBubbles = page.locator('.message, .message-bubble, [data-testid="message"]');
    this.itemInfo = page.locator('.item-info, [data-testid="item-info"]');
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back"), [data-testid="back-button"]');
    this.newChatButton = page.locator('button:has-text("New Chat"), button:has-text("Start Chat"), [data-testid="new-chat-button"]');
    this.emptyState = page.locator('.empty-state, [data-testid="empty-state"]');
  }

  /**
   * Navigate to message page
   */
  async goto(): Promise<void> {
    await this.page.goto('/messages');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for messages to load
   */
  async waitForMessages(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.messagesContainer).toBeVisible();
  }

  /**
   * Get count of chat items
   */
  async getChatsCount(): Promise<number> {
    return await this.chatItems.count();
  }

  /**
   * Click on a chat item
   */
  async clickChatItem(index: number = 0): Promise<void> {
    await this.chatItems.nth(index).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Send a message
   */
  async sendMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
    await this.sendButton.click();
    await this.page.waitForTimeout(500); // Wait for message to be sent
  }

  /**
   * Get count of messages
   */
  async getMessagesCount(): Promise<number> {
    return await this.messageBubbles.count();
  }

  /**
   * Get last message text
   */
  async getLastMessage(): Promise<string> {
    const lastMessage = this.messageBubbles.last();
    return await lastMessage.textContent() || '';
  }

  /**
   * Check if item info is visible
   */
  async expectItemInfoVisible(): Promise<void> {
    await expect(this.itemInfo).toBeVisible();
  }

  /**
   * Start new chat
   */
  async startNewChat(): Promise<void> {
    await this.newChatButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if empty state is visible
   */
  async expectEmptyStateVisible(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.backButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}

