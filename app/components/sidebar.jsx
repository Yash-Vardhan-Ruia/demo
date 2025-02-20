import React, { useState, useRef, useEffect } from "react"; // Fixed import statement
import Link from "next/link";
import { supabase } from "../../backend/supabaseClient";
import {
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  File,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cn } from "../components/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

// Helper to get the current user's id.
async function getCurrentUserId() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.user?.id;
}

export function Sidebar() {
  const [pages, setPages] = useState([]);
  const [profile, setProfile] = useState(null);
  const [renamePageId, setRenamePageId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const lastTapRef = useRef(0);

  // Fetch the current user's profile.
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = await getCurrentUserId();
      console.log("Fetched userId in Sidebar:", userId);
      if (userId) {
        const { data, error } = await supabase
          .from("api.profiles") // Changed to "api.profiles"
          .select("*")
          .eq("id", userId)
          .single();
        console.log("Profile data fetched:", data, "Profile error:", error);
        if (!error && data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  // Save pages for the current user using the API route.
  const updatePages = async (newPages) => {
    setPages(newPages);
    const userId = await getCurrentUserId();
    if (!userId) return;
    try {
      const res = await fetch("/api/userPages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, pages: newPages }),
      });
      if (!res.ok) {
        console.error("Error saving pages", await res.text());
      }
    } catch (err) {
      console.error("Error in updatePages:", err);
    }
  };

  // Fetch pages for the current user using the API route.
  const fetchUserFiles = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    try {
      const res = await fetch(`/api/userPages?user_id=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        console.error("Error fetching pages:", res.status, await res.text());
        return;
      }
      const json = await res.json();
      if (json.pages) setPages(json.pages);
      else setPages([]);
    } catch (err) {
      console.error("Error in fetchUserFiles:", err);
    }
  };

  // Load user's pages on mount.
  useEffect(() => {
    fetchUserFiles();
  }, []);

  // New functions for adding pages and folders.
  const addNewPage = async () => {
    const newPage = {
      id: Date.now().toString(),
      title: "Untitled",
      icon: <File className="h-4 w-4" />,
      href: "/",
      children: [],
    };
    await updatePages([...pages, newPage]);
  };

  const addNewFolder = async () => {
    const newFolder = {
      id: Date.now().toString(),
      title: "New Folder",
      icon: <span className="text-xl">📂</span>,
      isExpanded: true,
      children: [],
    };
    await updatePages([...pages, newFolder]);
  };

  const createNewPageOfType = async (pageType) => {
    const icons = {
      document: <File className="h-4 w-4" />,
      spreadsheet: <span className="text-xl">📊</span>,
      kanban: <span className="text-xl">🗂️</span>,
    };
    const newPage = {
      id: Date.now().toString(),
      title: "Untitled " + pageType.charAt(0).toUpperCase() + pageType.slice(1),
      type: pageType,
      icon: icons[pageType],
      href: "/", // Routing can be improved based on type
      children: [],
    };
    await updatePages([...pages, newPage]);
  };

  function createNewPageInFolder(folderId, pageType) {
    const icons = {
      document: <File className="h-4 w-4" />,
      spreadsheet: <span className="text-xl">📊</span>,
      kanban: <span className="text-xl">🗂️</span>,
    };
    const newPage = {
      id: Date.now().toString(),
      title: "Untitled " + pageType,
      type: pageType,
      icon: icons[pageType],
      children: [],
    };
    const insertPage = (items) =>
      items.map((item) => {
        if (item.id === folderId && item.children) {
          return { ...item, children: [...item.children, newPage] };
        }
        if (item.children) {
          return { ...item, children: insertPage(item.children) };
        }
        return item;
      });
    const updatedPages = insertPage(pages);
    updatePages(updatedPages);
  }

  const toggleFavorite = (pageId) => {
    const newPages = pages.map((page) =>
      page.id === pageId ? { ...page, isFavorite: !page.isFavorite } : page
    );
    updatePages(newPages);
  };

  const startRename = (pageId) => {
    const page = findPageById(pageId, pages);
    if (!page) return;
    setRenamePageId(pageId);
    setRenameValue(page.title);
  };

  const confirmRename = (pageId) => {
    const renamePages = (pagesArr) =>
      pagesArr.map((p) => {
        if (p.id === pageId) return { ...p, title: renameValue };
        if (p.children) return { ...p, children: renamePages(p.children) };
        return p;
      });
    updatePages(renamePages(pages));
    setRenamePageId(null);
    setRenameValue("");
  };

  const findPageById = (id, pagesArr) => {
    for (const p of pagesArr) {
      if (p.id === id) return p;
      if (p.children) {
        const child = findPageById(id, p.children);
        if (child) return child;
      }
    }
    return null;
  };

  // Render page with drag and drop integration placeholder and a dropdown arrow always visible.
  const renderPage = (page) => {
    const isRenaming = renamePageId === page.id;
    return (
      <div key={page.id} /* draggable integration placeholder */>
        <div className="group flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded-md cursor-pointer">
          <span className="mr-1">
            {page.children && page.children.length > 0
              ? (page.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
              : <ChevronRight className="h-4 w-4 opacity-0" />}
          </span>
          {page.icon}
          {!isRenaming ? (
            <Link
              href={page.href || "#"}
              className="flex-1"
              onClick={() => {
                const now = Date.now();
                if (now - lastTapRef.current < 300) startRename(page.id);
                lastTapRef.current = now;
              }}
            >
              {page.title}
            </Link>
          ) : (
            <Input
              value={renameValue}
              autoFocus
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => confirmRename(page.id)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmRename(page.id); }}
              className="flex-1 text-sm ml-1"
            />
          )}
          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(page.id)}>
            <Star className={cn("h-4 w-4", { "fill-yellow-400 text-yellow-400": page.isFavorite })} />
          </Button>
        </div>
        {page.children && page.isExpanded && (
          <div className="ml-4">
            {page.children.map((child) => renderPage(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#9C27B0] text-white flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={profile?.photo_url || "/default-avatar.svg"} alt="User photo" />
            <AvatarFallback>
              {profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}` : "UN"}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium">
            {profile ? `${profile.firstName} ${profile.lastName}` : "User Name"}
          </p>
        </div>
        <div className="flex gap-2 mb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">New Page</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => createNewPageOfType("document")}>
                Document
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => createNewPageOfType("spreadsheet")}>
                Spreadsheet
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => createNewPageOfType("kanban")}>
                Kanban
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={addNewFolder}>New Folder</Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-full">Create a new page</div>
        ) : (
          <div className="space-y-1">
            {pages.map((page) => renderPage(page))}
          </div>
        )}
      </div>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full flex items-center justify-center" onClick={fetchUserFiles}>
          <Trash2 className="mr-2 h-4 w-4" /> Trash
        </Button>
      </div>
    </div>
  );
}
